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
    public class EntityServiceGetAllWithoutMetadataTests : TestBase
    {
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<EntityService<User, UserRequest, long>>> _loggerMock;
        private readonly Mock<IFilterTranslator> _filterTranslatorMock;
        private readonly Mock<IEntitySupportService> _entitySupportServiceMock;

        public EntityServiceGetAllWithoutMetadataTests()
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

        #region GetAllWhitOutMetadata - Basic

        [Fact]
        public void GetAllWhitOutMetadata_WithNoFilters_ShouldReturnAllRecords()
        {
            // Arrange
            var user1 = TestDataFactory.CreateUser(id: 1, name: "User 1", state: 1);
            var user2 = TestDataFactory.CreateUser(id: 2, name: "User 2", state: 1);
            DbContext.Users.AddRange(user1, user2);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data.Should().HaveCount(2);
        }

        [Fact]
        public void GetAllWhitOutMetadata_WithFilters_ShouldApplyFilter()
        {
            // Arrange
            var user1 = TestDataFactory.CreateUser(id: 1, name: "Admin", state: 1);
            var user2 = TestDataFactory.CreateUser(id: 2, name: "Regular", state: 1);
            DbContext.Users.AddRange(user1, user2);
            DbContext.SaveChanges();

            Expression<Func<User, bool>> filterExpr = u => u.Name == "Admin";
            _filterTranslatorMock
                .Setup(f => f.TranslateToEfFilter<User>("Name:eq:Admin"))
                .Returns(filterExpr);

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: "Name:eq:Admin");

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(1);
            response.Data![0].Name.Should().Be("Admin");
        }

        [Fact]
        public void GetAllWhitOutMetadata_WithPagination_ShouldReturnPagedResults()
        {
            // Arrange
            for (int i = 1; i <= 10; i++)
            {
                DbContext.Users.Add(TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1));
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null, pageNumber: 1, pageSize: 5);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(5);
        }

        [Fact]
        public void GetAllWhitOutMetadata_WithIncludeTotal_ShouldReturnTotalCount()
        {
            // Arrange
            for (int i = 1; i <= 10; i++)
            {
                DbContext.Users.Add(TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1));
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null, pageNumber: 1, pageSize: 5, includeTotal: true);

            // Assert
            response.Success.Should().BeTrue();
            response.TotalResults.Should().Be(10);
        }

        [Fact]
        public void GetAllWhitOutMetadata_WithoutIncludeTotal_ShouldReturnEstimatedCount()
        {
            // Arrange
            for (int i = 1; i <= 10; i++)
            {
                DbContext.Users.Add(TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1));
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null, pageNumber: 1, pageSize: 5, includeTotal: false);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(5);
            // Estimated count: skip(0) + data.Count(5) + hasMore(1) = 6
            response.TotalResults.Should().BeGreaterThan(5);
        }

        [Fact]
        public void GetAllWhitOutMetadata_WithValidIncludes_ShouldNotThrow()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, state: 1);
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null, includes: new[] { "Rol" });

            // Assert
            response.Success.Should().BeTrue();
        }

        [Fact]
        public void GetAllWhitOutMetadata_WithInvalidIncludes_ShouldReturnError()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, state: 1);
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null, includes: new[] { "NonExistentProperty" });

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Contain("Error en Include");
        }

        [Fact]
        public void GetAllWhitOutMetadata_WithPage2_ShouldSkipFirstPage()
        {
            // Arrange
            for (int i = 1; i <= 10; i++)
            {
                DbContext.Users.Add(TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1));
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null, pageNumber: 2, pageSize: 5);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(5);
        }

        [Fact]
        public void GetAllWhitOutMetadata_LastPage_ShouldReturnRemainingItems()
        {
            // Arrange
            for (int i = 1; i <= 7; i++)
            {
                DbContext.Users.Add(TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1));
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAllWhitOutMetadata(filters: null, pageNumber: 2, pageSize: 5);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(2);
        }

        #endregion

        #region GetAll - Includes Error Path

        [Fact]
        public void GetAll_WithInvalidIncludes_ShouldReturnError()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, state: 1);
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null, includes: new[] { "InvalidNavProp" });

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Contain("Error en Include");
        }

        [Fact]
        public void GetAll_WithIncludeTotal_ShouldReturnExactCount()
        {
            // Arrange
            for (int i = 1; i <= 8; i++)
            {
                DbContext.Users.Add(TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1));
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null, pageNumber: 1, pageSize: 3, includeTotal: true);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(3);
            response.TotalResults.Should().Be(8);
        }

        [Fact]
        public void GetAll_WithoutIncludeTotal_ShouldReturnEstimatedCount()
        {
            // Arrange
            for (int i = 1; i <= 8; i++)
            {
                DbContext.Users.Add(TestDataFactory.CreateUser(id: i, name: $"User {i}", state: 1));
            }
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetAll(filters: null, pageNumber: 1, pageSize: 3, includeTotal: false);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().HaveCount(3);
            // Estimated: skip(0) + data.Count(3) + hasMore(1) = 4
            response.TotalResults.Should().BeGreaterThan(0);
        }

        #endregion
    }
}
