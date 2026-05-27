using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using MapsterMapper;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Services
{
    public class EntityServiceCreateTests : TestBase
    {
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<EntityService<User, UserRequest, long>>> _loggerMock;
        private readonly Mock<IFilterTranslator> _filterTranslatorMock;
        private readonly Mock<IEntitySupportService> _entitySupportServiceMock;
        private readonly Mock<IValidator<UserRequest>> _createValidatorMock;
        private readonly Mock<IEntityBeforeCreateInterceptor<User, UserRequest>> _beforeCreateInterceptorMock;
        private readonly Mock<IEntityAfterCreateInterceptor<User, UserRequest>> _afterCreateInterceptorMock;

        public EntityServiceCreateTests()
        {
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<EntityService<User, UserRequest, long>>>();
            _filterTranslatorMock = new Mock<IFilterTranslator>();
            _entitySupportServiceMock = new Mock<IEntitySupportService>();
            _createValidatorMock = new Mock<IValidator<UserRequest>>();
            _beforeCreateInterceptorMock = new Mock<IEntityBeforeCreateInterceptor<User, UserRequest>>();
            _afterCreateInterceptorMock = new Mock<IEntityAfterCreateInterceptor<User, UserRequest>>();
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
        public void Create_ValidRequest_InvokesCreateKeyedValidator()
        {
            // Arrange
            var request = new UserRequest
            {
                Name = "John Doe",
                Email = "john@test.com",
                UserName = "johndoe",
                Password = "securepass",
                RolId = 1,
                CreatedBy = 1
            };

            var validationResult = new ValidationResult();
            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var mappedEntity = TestDataFactory.CreateUser(id: 0, name: "John Doe");
            _mapperMock.Setup(m => m.Map<User>(request)).Returns(mappedEntity);

            _entitySupportServiceMock
                .Setup(s => s.GetBeforeCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeCreateInterceptor<User, UserRequest>>());
            _entitySupportServiceMock
                .Setup(s => s.GetAfterCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterCreateInterceptor<User, UserRequest>>());

            var service = CreateService();

            // Act
            service.Create(request);

            // Assert
            _entitySupportServiceMock.Verify(s => s.GetValidator<UserRequest>("Create"), Times.Once);
            _createValidatorMock.Verify(v => v.Validate(request), Times.Once);
        }

        [Fact]
        public void Create_ValidRequest_MapsRequestToEntity()
        {
            // Arrange
            var request = new UserRequest
            {
                Name = "Jane Doe",
                Email = "jane@test.com",
                UserName = "janedoe",
                Password = "securepass",
                RolId = 1,
                CreatedBy = 1
            };

            var validationResult = new ValidationResult();
            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var mappedEntity = TestDataFactory.CreateUser(id: 0, name: "Jane Doe");
            _mapperMock.Setup(m => m.Map<User>(request)).Returns(mappedEntity);

            _entitySupportServiceMock
                .Setup(s => s.GetBeforeCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeCreateInterceptor<User, UserRequest>>());
            _entitySupportServiceMock
                .Setup(s => s.GetAfterCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterCreateInterceptor<User, UserRequest>>());

            var service = CreateService();

            // Act
            service.Create(request);

            // Assert
            _mapperMock.Verify(m => m.Map<User>(request), Times.Once);
        }

        [Fact]
        public void Create_ValidRequest_SetsCreatedAtToUtcNow_UpdatedAtNull_UpdatedByNull()
        {
            // Arrange
            var request = new UserRequest
            {
                Name = "Test User",
                Email = "test@test.com",
                UserName = "testuser",
                Password = "securepass",
                RolId = 1,
                CreatedBy = 1
            };

            var validationResult = new ValidationResult();
            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var mappedEntity = new User
            {
                Id = 0,
                Name = "Test User",
                Email = "test@test.com",
                UserName = "testuser",
                Password = "securepass",
                RolId = 1,
                Number = "12345678",
                IdentificationDocument = "1234567890101",
                State = 1,
                CreatedBy = 1,
                CreatedAt = DateTime.MinValue, // Will be overwritten
                UpdatedAt = DateTime.UtcNow,   // Will be set to null
                UpdatedBy = 99                  // Will be set to null
            };
            _mapperMock.Setup(m => m.Map<User>(request)).Returns(mappedEntity);

            _entitySupportServiceMock
                .Setup(s => s.GetBeforeCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeCreateInterceptor<User, UserRequest>>());
            _entitySupportServiceMock
                .Setup(s => s.GetAfterCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterCreateInterceptor<User, UserRequest>>());

            var service = CreateService();
            var beforeCreate = DateTime.UtcNow;

            // Act
            var response = service.Create(request);

            var afterCreate = DateTime.UtcNow;

            // Assert
            response.Data.Should().NotBeNull();
            response.Data!.CreatedAt.Should().BeOnOrAfter(beforeCreate).And.BeOnOrBefore(afterCreate);
            response.Data.UpdatedAt.Should().BeNull();
            response.Data.UpdatedBy.Should().BeNull();
        }

        [Fact]
        public void Create_ValidRequest_CallsBeforeCreateAndAfterCreateInterceptors()
        {
            // Arrange
            var request = new UserRequest
            {
                Name = "Interceptor User",
                Email = "interceptor@test.com",
                UserName = "interceptoruser",
                Password = "securepass",
                RolId = 1,
                CreatedBy = 1
            };

            var validationResult = new ValidationResult();
            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var mappedEntity = TestDataFactory.CreateUser(id: 0, name: "Interceptor User");
            _mapperMock.Setup(m => m.Map<User>(request)).Returns(mappedEntity);

            _beforeCreateInterceptorMock
                .Setup(i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request))
                .Returns((Response<User, List<ValidationFailure>> r, UserRequest _) => r);

            _afterCreateInterceptorMock
                .Setup(i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request))
                .Returns((Response<User, List<ValidationFailure>> r, UserRequest _) => r);

            _entitySupportServiceMock
                .Setup(s => s.GetBeforeCreateInterceptors<User, UserRequest>())
                .Returns(new[] { _beforeCreateInterceptorMock.Object });
            _entitySupportServiceMock
                .Setup(s => s.GetAfterCreateInterceptors<User, UserRequest>())
                .Returns(new[] { _afterCreateInterceptorMock.Object });

            var service = CreateService();

            // Act
            service.Create(request);

            // Assert
            _beforeCreateInterceptorMock.Verify(
                i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request),
                Times.Once);
            _afterCreateInterceptorMock.Verify(
                i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request),
                Times.Once);
        }

        [Fact]
        public void Create_ValidRequest_PersistsEntityInDatabase()
        {
            // Arrange
            var request = new UserRequest
            {
                Name = "Persisted User",
                Email = "persist@test.com",
                UserName = "persistuser",
                Password = "securepass",
                RolId = 1,
                CreatedBy = 1
            };

            var validationResult = new ValidationResult();
            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var mappedEntity = new User
            {
                Id = 0,
                Name = "Persisted User",
                Email = "persist@test.com",
                UserName = "persistuser",
                Password = "securepass",
                RolId = 1,
                Number = "12345678",
                IdentificationDocument = "1234567890101",
                State = 1,
                CreatedBy = 1
            };
            _mapperMock.Setup(m => m.Map<User>(request)).Returns(mappedEntity);

            _entitySupportServiceMock
                .Setup(s => s.GetBeforeCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeCreateInterceptor<User, UserRequest>>());
            _entitySupportServiceMock
                .Setup(s => s.GetAfterCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterCreateInterceptor<User, UserRequest>>());

            var service = CreateService();

            // Act
            service.Create(request);

            // Assert
            DbContext.Users.Should().HaveCount(1);
            DbContext.Users.First().Name.Should().Be("Persisted User");
        }

        [Fact]
        public void Create_ValidRequest_ReturnsResponseWithSuccessTrue()
        {
            // Arrange
            var request = new UserRequest
            {
                Name = "Success User",
                Email = "success@test.com",
                UserName = "successuser",
                Password = "securepass",
                RolId = 1,
                CreatedBy = 1
            };

            var validationResult = new ValidationResult();
            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var mappedEntity = TestDataFactory.CreateUser(id: 0, name: "Success User");
            _mapperMock.Setup(m => m.Map<User>(request)).Returns(mappedEntity);

            _entitySupportServiceMock
                .Setup(s => s.GetBeforeCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeCreateInterceptor<User, UserRequest>>());
            _entitySupportServiceMock
                .Setup(s => s.GetAfterCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterCreateInterceptor<User, UserRequest>>());

            var service = CreateService();

            // Act
            var response = service.Create(request);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public void Create_ValidationFails_ReturnsResponseWithSuccessFalse()
        {
            // Arrange
            var request = new UserRequest
            {
                Name = null,
                Email = null,
                CreatedBy = null
            };

            var validationFailures = new List<ValidationFailure>
            {
                new("Name", "El nombre es requerido"),
                new("Email", "El email es requerido"),
                new("CreatedBy", "El Usuario creador no puede ser nulo")
            };
            var validationResult = new ValidationResult(validationFailures);

            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var service = CreateService();

            // Act
            var response = service.Create(request);

            // Assert
            response.Success.Should().BeFalse();
        }

        [Fact]
        public void Create_ValidationFails_ReturnsMessageValidationFailed()
        {
            // Arrange
            var request = new UserRequest { Name = null };

            var validationFailures = new List<ValidationFailure>
            {
                new("Name", "El nombre es requerido")
            };
            var validationResult = new ValidationResult(validationFailures);

            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var service = CreateService();

            // Act
            var response = service.Create(request);

            // Assert
            response.Message.Should().Be("Validation failed");
        }

        [Fact]
        public void Create_ValidationFails_ReturnsErrorsContainingValidationFailureList()
        {
            // Arrange
            var request = new UserRequest { Name = null, Email = null };

            var validationFailures = new List<ValidationFailure>
            {
                new("Name", "El nombre es requerido"),
                new("Email", "El email es requerido")
            };
            var validationResult = new ValidationResult(validationFailures);

            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var service = CreateService();

            // Act
            var response = service.Create(request);

            // Assert
            response.Errors.Should().NotBeNull();
            response.Errors.Should().HaveCount(2);
            response.Errors.Should().Contain(e => e.PropertyName == "Name");
            response.Errors.Should().Contain(e => e.PropertyName == "Email");
        }

        [Fact]
        public void Create_ValidationFails_ReturnsDataNull()
        {
            // Arrange
            var request = new UserRequest { Name = null };

            var validationFailures = new List<ValidationFailure>
            {
                new("Name", "El nombre es requerido")
            };
            var validationResult = new ValidationResult(validationFailures);

            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var service = CreateService();

            // Act
            var response = service.Create(request);

            // Assert
            response.Data.Should().BeNull();
        }

        [Fact]
        public void Create_ValidationFails_DoesNotCallSaveChanges()
        {
            // Arrange
            var request = new UserRequest { Name = null };

            var validationFailures = new List<ValidationFailure>
            {
                new("Name", "El nombre es requerido")
            };
            var validationResult = new ValidationResult(validationFailures);

            _createValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(_createValidatorMock.Object);

            var service = CreateService();

            // Act
            service.Create(request);

            // Assert - No entity should be persisted
            DbContext.Users.Should().BeEmpty();
            // Mapper should never be called when validation fails
            _mapperMock.Verify(m => m.Map<User>(It.IsAny<UserRequest>()), Times.Never);
        }
    }
}
