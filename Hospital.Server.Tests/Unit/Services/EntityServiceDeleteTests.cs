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
    public class EntityServiceDeleteTests : TestBase
    {
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<EntityService<User, UserRequest, long>>> _loggerMock;
        private readonly Mock<IFilterTranslator> _filterTranslatorMock;
        private readonly Mock<IEntitySupportService> _entitySupportServiceMock;

        public EntityServiceDeleteTests()
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
        public void Delete_ValidId_RetrievesEntityAndSetsStateToZero()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, name: "User To Delete");
            DbContext.Users.Add(user);
            DbContext.SaveChanges();
            DbContext.ChangeTracker.Clear(); // Detach all entities to simulate fresh context

            var service = CreateService();

            // Act
            var response = service.Delete(1L, deletedBy: 99);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data!.State.Should().Be(0);
        }

        [Fact]
        public void Delete_ValidId_SetsUpdatedByToDeletedByParameter()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 2, name: "User To Delete");
            DbContext.Users.Add(user);
            DbContext.SaveChanges();
            DbContext.ChangeTracker.Clear();

            var service = CreateService();

            // Act
            var response = service.Delete(2L, deletedBy: 42);

            // Assert
            response.Success.Should().BeTrue();
            response.Data!.UpdatedBy.Should().Be(42);
        }

        [Fact]
        public void Delete_ValidId_SetsUpdatedAt()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 3, name: "User To Delete");
            DbContext.Users.Add(user);
            DbContext.SaveChanges();
            DbContext.ChangeTracker.Clear();

            var service = CreateService();
            var beforeDelete = DateTime.Now;

            // Act
            var response = service.Delete(3L, deletedBy: 1);

            var afterDelete = DateTime.Now;

            // Assert
            response.Success.Should().BeTrue();
            response.Data!.UpdatedAt.Should().NotBeNull();
            response.Data.UpdatedAt!.Value.Should().BeOnOrAfter(beforeDelete).And.BeOnOrBefore(afterDelete);
        }

        [Fact]
        public void Delete_ValidId_PersistsChangesInDatabase()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 4, name: "User To Delete");
            DbContext.Users.Add(user);
            DbContext.SaveChanges();
            DbContext.ChangeTracker.Clear();

            var service = CreateService();

            // Act
            service.Delete(4L, deletedBy: 1);

            // Assert - Verify entity is soft-deleted in DB
            DbContext.ChangeTracker.Clear();
            var deletedUser = DbContext.Users.Find(4L);
            deletedUser.Should().NotBeNull();
            deletedUser!.State.Should().Be(0);
        }

        [Fact]
        public void Delete_ValidId_ReturnsResponseWithSuccessTrue()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 5, name: "User To Delete");
            DbContext.Users.Add(user);
            DbContext.SaveChanges();
            DbContext.ChangeTracker.Clear();

            var service = CreateService();

            // Act
            var response = service.Delete(5L, deletedBy: 1);

            // Assert
            response.Success.Should().BeTrue();
            response.Message.Should().Contain("deleted successfully");
        }

        [Fact]
        public void Delete_ZeroId_ReturnsResponseWithSuccessFalse()
        {
            // Arrange
            var service = CreateService();

            // Act
            var response = service.Delete(0L, deletedBy: 1);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be("Invalid Id");
            response.Errors.Should().NotBeNull();
            response.Errors.Should().Contain(e => e.PropertyName == "Id");
        }

        [Fact]
        public void Delete_NegativeId_ReturnsResponseWithSuccessFalse()
        {
            // Arrange
            var service = CreateService();

            // Act
            var response = service.Delete(-5L, deletedBy: 1);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be("Invalid Id");
            response.Errors.Should().NotBeNull();
            response.Errors.Should().Contain(e => e.PropertyName == "Id");
        }

        [Fact]
        public void Delete_NonExistentEntity_ReturnsResponseWithSuccessFalse()
        {
            // Arrange
            var service = CreateService();

            // Act
            var response = service.Delete(999L, deletedBy: 1);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Contain("not found");
            response.Errors.Should().NotBeNull();
            response.Errors.Should().Contain(e => e.PropertyName == "Id");
        }
    }
}
