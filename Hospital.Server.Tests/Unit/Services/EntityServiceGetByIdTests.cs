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
    public class EntityServiceGetByIdTests : TestBase
    {
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<EntityService<User, UserRequest, long>>> _loggerMock;
        private readonly Mock<IFilterTranslator> _filterTranslatorMock;
        private readonly Mock<IEntitySupportService> _entitySupportServiceMock;

        public EntityServiceGetByIdTests()
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
        public void GetById_WithExistingId_ShouldReturnEntity()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, name: "Test User", state: 1);
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetById(1);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data!.Name.Should().Be("Test User");
        }

        [Fact]
        public void GetById_WithNonExistentId_ShouldReturnNotFound()
        {
            // Arrange
            var service = CreateService();

            // Act
            var response = service.GetById(999);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Contain("not found");
        }

        [Fact]
        public void GetById_WithValidIncludes_ShouldReturnEntityWithRelations()
        {
            // Arrange
            var rol = new Rol { Id = 1, Name = "Admin", State = 1, CreatedBy = 1 };
            DbContext.Roles.Add(rol);
            var user = TestDataFactory.CreateUser(id: 1, state: 1, rolId: 1);
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetById(1, includes: new[] { "Rol" });

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public void GetById_WithInvalidIncludes_ShouldReturnError()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, state: 1);
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var service = CreateService();

            // Act
            var response = service.GetById(1, includes: new[] { "NonExistentProp" });

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Contain("Error en Include");
        }
    }
}
