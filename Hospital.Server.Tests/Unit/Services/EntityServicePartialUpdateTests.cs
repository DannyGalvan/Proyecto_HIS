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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Services
{
    public class EntityServicePartialUpdateTests : TestBase
    {
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<EntityService<User, UserRequest, long>>> _loggerMock;
        private readonly Mock<IFilterTranslator> _filterTranslatorMock;
        private readonly Mock<IEntitySupportService> _entitySupportServiceMock;
        private readonly Mock<IValidator<UserRequest>> _partialValidatorMock;
        private readonly Mock<IEntityBeforeUpdateInterceptor<User, UserRequest>> _beforeUpdateInterceptorMock;
        private readonly Mock<IEntityAfterPartialUpdateInterceptor<User, UserRequest>> _afterPartialUpdateInterceptorMock;

        public EntityServicePartialUpdateTests()
        {
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<EntityService<User, UserRequest, long>>>();
            _filterTranslatorMock = new Mock<IFilterTranslator>();
            _entitySupportServiceMock = new Mock<IEntitySupportService>();
            _partialValidatorMock = new Mock<IValidator<UserRequest>>();
            _beforeUpdateInterceptorMock = new Mock<IEntityBeforeUpdateInterceptor<User, UserRequest>>();
            _afterPartialUpdateInterceptorMock = new Mock<IEntityAfterPartialUpdateInterceptor<User, UserRequest>>();
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

        private User SeedExistingUser(long id = 1)
        {
            var user = new User
            {
                Id = id,
                Name = "Original Name",
                Email = "original@test.com",
                UserName = "originaluser",
                Password = "hashedpassword",
                RolId = 1,
                Number = "12345678",
                IdentificationDocument = "1234567890101",
                State = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                CreatedBy = 1,
                UpdatedAt = null,
                UpdatedBy = null
            };

            DbContext.Users.Add(user);
            DbContext.SaveChanges();
            DbContext.Entry(user).State = EntityState.Detached;

            return user;
        }

        private void SetupMapperForPartialUpdate()
        {
            // Map from UserRequest to User (for the incoming request)
            // For partial updates, null properties should remain null in the mapped entity
            // This reflects how Mapster handles nullable-to-non-nullable mapping
            _mapperMock.Setup(m => m.Map<User>(It.IsAny<UserRequest>()))
                .Returns((UserRequest r) => new User
                {
                    Id = r.Id ?? 0,
                    Name = r.Name ?? null!,
                    Email = r.Email ?? null!,
                    UserName = r.UserName ?? null!,
                    Password = r.Password ?? null!,
                    RolId = r.RolId ?? 0,
                    Number = null!,
                    IdentificationDocument = null!,
                    State = r.State ?? 0,
                    CreatedBy = r.CreatedBy ?? 0,
                    UpdatedBy = r.UpdatedBy,
                    CreatedAt = DateTime.MinValue,
                    UpdatedAt = null
                });

            // Map from User to User (for cloning the existing entity)
            _mapperMock.Setup(m => m.Map<User>(It.IsAny<User>()))
                .Returns((User u) => new User
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    UserName = u.UserName,
                    Password = u.Password,
                    RolId = u.RolId,
                    Number = u.Number,
                    IdentificationDocument = u.IdentificationDocument,
                    State = u.State,
                    CreatedBy = u.CreatedBy,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    UpdatedBy = u.UpdatedBy
                });
        }

        private void SetupNoInterceptors()
        {
            _entitySupportServiceMock
                .Setup(s => s.GetBeforeUpdateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeUpdateInterceptor<User, UserRequest>>());
            _entitySupportServiceMock
                .Setup(s => s.GetAfterPartialUpdateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterPartialUpdateInterceptor<User, UserRequest>>());
        }

        #region PartialUpdate - Valid Request

        [Fact]
        public void PartialUpdate_ValidRequest_InvokesPartialKeyedValidator()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Partially Updated",
                UpdatedBy = 2
            };

            var validationResult = new ValidationResult();
            _partialValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(_partialValidatorMock.Object);

            SetupMapperForPartialUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            service.PartialUpdate(request);

            // Assert
            _entitySupportServiceMock.Verify(s => s.GetValidator<UserRequest>("Partial"), Times.Once);
            _partialValidatorMock.Verify(v => v.Validate(request), Times.Once);
        }

        [Fact]
        public void PartialUpdate_ValidRequest_AppliesOnlyNonNullNonZeroProperties()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Partially Updated",
                UpdatedBy = 2
                // Email, UserName, RolId etc. are null/zero - should not be applied
            };

            var validationResult = new ValidationResult();
            _partialValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(_partialValidatorMock.Object);

            SetupMapperForPartialUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.PartialUpdate(request);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data!.Name.Should().Be("Partially Updated"); // Updated
            response.Data.Email.Should().Be("original@test.com"); // Preserved (null in request maps to empty, but zero/empty skipped)
            response.Data.UserName.Should().Be("originaluser"); // Preserved
            response.Data.RolId.Should().Be(1); // Preserved (zero skipped)
        }

        [Fact]
        public void PartialUpdate_ValidRequest_SetsUpdatedAt()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Partially Updated",
                UpdatedBy = 2
            };

            var validationResult = new ValidationResult();
            _partialValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(_partialValidatorMock.Object);

            SetupMapperForPartialUpdate();
            SetupNoInterceptors();

            var service = CreateService();
            var beforeUpdate = DateTime.UtcNow;

            // Act
            var response = service.PartialUpdate(request);

            var afterUpdate = DateTime.UtcNow;

            // Assert
            response.Data.Should().NotBeNull();
            response.Data!.UpdatedAt.Should().NotBeNull();
            response.Data.UpdatedAt!.Value.Should().BeOnOrAfter(beforeUpdate).And.BeOnOrBefore(afterUpdate);
        }

        [Fact]
        public void PartialUpdate_ValidRequest_PreservesCreatedAt()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var originalCreatedAt = existingUser.CreatedAt;

            var request = new UserRequest
            {
                Id = 1,
                Name = "Partially Updated",
                UpdatedBy = 2
            };

            var validationResult = new ValidationResult();
            _partialValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(_partialValidatorMock.Object);

            SetupMapperForPartialUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.PartialUpdate(request);

            // Assert
            response.Data.Should().NotBeNull();
            response.Data!.CreatedAt.Should().BeCloseTo(originalCreatedAt, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void PartialUpdate_ValidRequest_ReturnsResponseWithSuccessTrue()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Partially Updated",
                UpdatedBy = 2
            };

            var validationResult = new ValidationResult();
            _partialValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(_partialValidatorMock.Object);

            SetupMapperForPartialUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.PartialUpdate(request);

            // Assert
            response.Success.Should().BeTrue();
        }

        #endregion

        #region PartialUpdate - Non-existent Entity

        [Fact]
        public void PartialUpdate_NonExistentEntity_ReturnsResponseWithSuccessFalse()
        {
            // Arrange - No entity seeded
            var request = new UserRequest
            {
                Id = 999,
                Name = "Partially Updated",
                UpdatedBy = 2
            };

            var validationResult = new ValidationResult();
            _partialValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(_partialValidatorMock.Object);

            SetupMapperForPartialUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.PartialUpdate(request);

            // Assert
            response.Success.Should().BeFalse();
        }

        [Fact]
        public void PartialUpdate_NonExistentEntity_ReturnsErrorsWithPropertyNameId()
        {
            // Arrange - No entity seeded
            var request = new UserRequest
            {
                Id = 999,
                Name = "Partially Updated",
                UpdatedBy = 2
            };

            var validationResult = new ValidationResult();
            _partialValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(_partialValidatorMock.Object);

            SetupMapperForPartialUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.PartialUpdate(request);

            // Assert
            response.Errors.Should().NotBeNull();
            response.Errors.Should().Contain(e => e.PropertyName == "Id");
        }

        #endregion
    }
}
