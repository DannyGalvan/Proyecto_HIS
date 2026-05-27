using System.Linq.Expressions;
using FluentAssertions;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using MapsterMapper;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Services
{
    public class EntityServiceGetAllTests : TestBase
    {
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<EntityService<User, UserRequest, long>>> _loggerMock;
        private readonly Mock<IFilterTranslator> _filterTranslatorMock;
        private readonly Mock<IEntitySupportService> _entitySupportServiceMock;

        public EntityServiceGetAllTests()
        {
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<EntityService<User, UserRequest, long>>>();
            _filterTranslatorMock = new Mock<IFilterTranslator>();
            _entitySupportServiceMock = new Mock<IEntitySupportService>();
        }

        private EntityService<User, UserRequest, long> CreateService()
        {
            return new EntityService<User, UserRequest, long>(
                _mapperMock.Object,
                _loggerMock.Object,
                DbContext,
                _filterTranslatorMock.Object,
                _entitySupportServiceMock.Object
            );
        }

        [Fact]
        public void GetAll_ExcludesSoftDeletedRecords()
        {
            // Arrange
            var activeUser1 = TestDataFactory.CreateUser(id: 1, name: "Active User 1", state: 1);
            var activeUser2 = TestDataFactory.CreateUser(id: 2, name: "Active User 2", state: 1);
            var deletedUser = TestDataFactory.CreateUser(id: 3, name: "Deleted User", state: 0);

            DbContext.Users.AddRange(activeUser1, activeUser2, deletedUser);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data.Should().HaveCount(2);
            response.Data.Should().NotContain(u => u.State == 0);
            response.Data.Should().NotContain(u => u.Name == "Deleted User");
        }

        [Fact]
        public void GetAll_WithFilters_AppliesFilterExpressionViaFilterTranslator()
        {
            // Arrange
            var user1 = TestDataFactory.CreateUser(id: 1, name: "Admin User", state: 1);
            var user2 = TestDataFactory.CreateUser(id: 2, name: "Regular User", state: 1);

            DbContext.Users.AddRange(user1, user2);
            DbContext.SaveChanges();

            // Setup filter translator to return a filter that matches only "Admin User"
            Expression<Func<User, bool>> filterExpression = u => u.Name == "Admin User";
            _filterTranslatorMock
                .Setup(f => f.TranslateToEfFilter<User>("Name:eq:Admin User"))
                .Returns(filterExpression);

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: "Name:eq:Admin User");

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data.Should().HaveCount(1);
            response.Data![0].Name.Should().Be("Admin User");
            _filterTranslatorMock.Verify(f => f.TranslateToEfFilter<User>("Name:eq:Admin User"), Times.Once);
        }

        [Fact]
        public void GetAll_OrdersResultsByCreatedAtDescending()
        {
            // Arrange
            var oldUser = TestDataFactory.CreateUser(id: 1, name: "Old User", state: 1);
            oldUser.CreatedAt = DateTime.UtcNow.AddDays(-10);

            var middleUser = TestDataFactory.CreateUser(id: 2, name: "Middle User", state: 1);
            middleUser.CreatedAt = DateTime.UtcNow.AddDays(-5);

            var recentUser = TestDataFactory.CreateUser(id: 3, name: "Recent User", state: 1);
            recentUser.CreatedAt = DateTime.UtcNow;

            DbContext.Users.AddRange(oldUser, middleUser, recentUser);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(3);
            response.Data![0].Name.Should().Be("Recent User");
            response.Data[1].Name.Should().Be("Middle User");
            response.Data[2].Name.Should().Be("Old User");
        }

        [Fact]
        public void GetAll_WithFilters_SoftDeletedRecordsExcludedEvenWhenFilterMatches()
        {
            // Arrange
            var activeUser = TestDataFactory.CreateUser(id: 1, name: "Admin Active", state: 1);
            var deletedUser = TestDataFactory.CreateUser(id: 2, name: "Admin Deleted", state: 0);

            DbContext.Users.AddRange(activeUser, deletedUser);
            DbContext.SaveChanges();

            // Filter that would match both users by name pattern
            Expression<Func<User, bool>> filterExpression = u => u.Name.Contains("Admin");
            _filterTranslatorMock
                .Setup(f => f.TranslateToEfFilter<User>("Name:like:Admin"))
                .Returns(filterExpression);

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: "Name:like:Admin");

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(1);
            response.Data![0].Name.Should().Be("Admin Active");
        }

        [Fact]
        public void GetAll_WithPagination_SkipsCorrectNumberOfRecords()
        {
            // Arrange - Create 5 users with different creation dates for deterministic ordering
            for (int i = 1; i <= 5; i++)
            {
                var user = TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1);
                user.CreatedAt = DateTime.UtcNow.AddMinutes(i); // User 5 is most recent
                DbContext.Users.Add(user);
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act - Page 2 with pageSize 2 should skip first 2 records
            var response = service.GetAll(filters: null, pageNumber: 2, pageSize: 2);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(2);
            // Ordered by CreatedAt descending: User5, User4, User3, User2, User1
            // Page 2 (skip 2, take 2): User3, User2
            response.Data![0].Name.Should().Be("User 3");
            response.Data[1].Name.Should().Be("User 2");
        }

        [Fact]
        public void GetAll_WithPagination_ReturnsAtMostPageSizeRecords()
        {
            // Arrange - Create 10 users
            for (int i = 1; i <= 10; i++)
            {
                var user = TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1);
                user.CreatedAt = DateTime.UtcNow.AddMinutes(i);
                DbContext.Users.Add(user);
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null, pageNumber: 1, pageSize: 3);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(3);
        }

        [Fact]
        public void GetAll_WithPagination_IncludeTotalTrue_ReturnsTotalResultsAsExactCount()
        {
            // Arrange - Create 7 active users and 2 deleted
            for (int i = 1; i <= 7; i++)
            {
                var user = TestDataFactory.CreateUser(id: i, name: $"Active User {i}", state: 1);
                user.CreatedAt = DateTime.UtcNow.AddMinutes(i);
                DbContext.Users.Add(user);
            }
            var deletedUser1 = TestDataFactory.CreateUser(id: 8, name: "Deleted 1", state: 0);
            var deletedUser2 = TestDataFactory.CreateUser(id: 9, name: "Deleted 2", state: 0);
            DbContext.Users.AddRange(deletedUser1, deletedUser2);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null, pageNumber: 1, pageSize: 3, includeTotal: true);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(3);
            response.TotalResults.Should().Be(7); // Only active records counted
        }

        [Fact]
        public void GetAll_WithPagination_IncludeTotalFalse_ReturnsEstimatedCount()
        {
            // Arrange - Create 5 active users
            for (int i = 1; i <= 5; i++)
            {
                var user = TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1);
                user.CreatedAt = DateTime.UtcNow.AddMinutes(i);
                DbContext.Users.Add(user);
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act - Page 1, pageSize 3, includeTotal false
            var response = service.GetAll(filters: null, pageNumber: 1, pageSize: 3, includeTotal: false);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(3);
            // Estimated: skip(0) + data.Count(3) + (pagedData.Count(4) > pageSize(3) ? 1 : 0) = 4
            response.TotalResults.Should().Be(4);
        }

        [Fact]
        public void GetAll_LastPage_ReturnsRemainingRecords()
        {
            // Arrange - Create 5 active users
            for (int i = 1; i <= 5; i++)
            {
                var user = TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1);
                user.CreatedAt = DateTime.UtcNow.AddMinutes(i);
                DbContext.Users.Add(user);
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act - Page 3 with pageSize 2 should return only 1 record (User 1)
            var response = service.GetAll(filters: null, pageNumber: 3, pageSize: 2);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(1);
            response.Data![0].Name.Should().Be("User 1"); // Oldest user (lowest CreatedAt)
        }

        [Fact]
        public void GetAll_NullFilters_ReturnsAllActiveRecords()
        {
            // Arrange
            var user1 = TestDataFactory.CreateUser(id: 1, name: "User 1", state: 1);
            var user2 = TestDataFactory.CreateUser(id: 2, name: "User 2", state: 1);

            DbContext.Users.AddRange(user1, user2);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(2);
            // FilterTranslator should NOT be called when filters is null
            _filterTranslatorMock.Verify(
                f => f.TranslateToEfFilter<User>(It.IsAny<string>()),
                Times.Never);
        }

        [Fact]
        public void GetAll_EmptyFilters_ReturnsAllActiveRecords()
        {
            // Arrange
            var user1 = TestDataFactory.CreateUser(id: 1, name: "User 1", state: 1);
            var user2 = TestDataFactory.CreateUser(id: 2, name: "User 2", state: 1);

            DbContext.Users.AddRange(user1, user2);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: "");

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(2);
            // FilterTranslator should NOT be called when filters is empty
            _filterTranslatorMock.Verify(
                f => f.TranslateToEfFilter<User>(It.IsAny<string>()),
                Times.Never);
        }
    }
}
