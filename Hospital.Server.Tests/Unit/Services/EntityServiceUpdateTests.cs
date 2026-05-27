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
    public class EntityServiceUpdateTests : TestBase
    {
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<EntityService<User, UserRequest, long>>> _loggerMock;
        private readonly Mock<IFilterTranslator> _filterTranslatorMock;
        private readonly Mock<IEntitySupportService> _entitySupportServiceMock;
        private readonly Mock<IValidator<UserRequest>> _updateValidatorMock;
        private readonly Mock<IEntityBeforeUpdateInterceptor<User, UserRequest>> _beforeUpdateInterceptorMock;
        private readonly Mock<IEntityAfterUpdateInterceptor<User, UserRequest>> _afterUpdateInterceptorMock;

        public EntityServiceUpdateTests()
        {
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<EntityService<User, UserRequest, long>>>();
            _filterTranslatorMock = new Mock<IFilterTranslator>();
            _entitySupportServiceMock = new Mock<IEntitySupportService>();
            _updateValidatorMock = new Mock<IValidator<UserRequest>>();
            _beforeUpdateInterceptorMock = new Mock<IEntityBeforeUpdateInterceptor<User, UserRequest>>();
            _afterUpdateInterceptorMock = new Mock<IEntityAfterUpdateInterceptor<User, UserRequest>>();
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

        private void SetupMapperForUpdate()
        {
            // Map from UserRequest to User (for the incoming request)
            _mapperMock.Setup(m => m.Map<User>(It.IsAny<UserRequest>()))
                .Returns((UserRequest r) => new User
                {
                    Id = r.Id ?? 0,
                    Name = r.Name ?? string.Empty,
                    Email = r.Email ?? string.Empty,
                    UserName = r.UserName ?? string.Empty,
                    Password = r.Password ?? string.Empty,
                    RolId = r.RolId ?? 0,
                    Number = "12345678",
                    IdentificationDocument = "1234567890101",
                    State = r.State ?? 1,
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
                .Setup(s => s.GetAfterUpdateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterUpdateInterceptor<User, UserRequest>>());
        }

        #region Update - Valid Request

        [Fact]
        public void Update_ValidRequest_InvokesUpdateKeyedValidator()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            service.Update(request);

            // Assert
            _entitySupportServiceMock.Verify(s => s.GetValidator<UserRequest>("Update"), Times.Once);
            _updateValidatorMock.Verify(v => v.Validate(request), Times.Once);
        }

        [Fact]
        public void Update_ValidRequest_RetrievesEntityById()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.Update(request);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data!.Id.Should().Be(1);
        }

        [Fact]
        public void Update_ValidRequest_AppliesNonNullProperties_SkipsIdCreatedAtCreatedByPassword()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var originalCreatedAt = existingUser.CreatedAt;
            var originalPassword = existingUser.Password;

            var request = new UserRequest
            {
                Id = 1,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 2,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1,
                Password = "newpassword" // Should be skipped by UpdateProperties
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.Update(request);

            // Assert
            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data!.Name.Should().Be("Updated Name");
            response.Data.Email.Should().Be("updated@test.com");
            response.Data.Id.Should().Be(1); // Id preserved
            response.Data.CreatedBy.Should().Be(1); // CreatedBy preserved
            response.Data.Password.Should().Be(originalPassword); // Password skipped
        }

        [Fact]
        public void Update_ValidRequest_SetsUpdatedAtToUtcNow()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();
            var beforeUpdate = DateTime.UtcNow;

            // Act
            var response = service.Update(request);

            var afterUpdate = DateTime.UtcNow;

            // Assert
            response.Data.Should().NotBeNull();
            response.Data!.UpdatedAt.Should().NotBeNull();
            response.Data.UpdatedAt!.Value.Should().BeOnOrAfter(beforeUpdate).And.BeOnOrBefore(afterUpdate);
        }

        [Fact]
        public void Update_ValidRequest_PreservesCreatedAt()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var originalCreatedAt = existingUser.CreatedAt;

            var request = new UserRequest
            {
                Id = 1,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.Update(request);

            // Assert
            response.Data.Should().NotBeNull();
            response.Data!.CreatedAt.Should().BeCloseTo(originalCreatedAt, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void Update_ValidRequest_CallsBeforeUpdateAndAfterUpdateInterceptors()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();

            _beforeUpdateInterceptorMock
                .Setup(i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request))
                .Returns((Response<User, List<ValidationFailure>> r, UserRequest _) => r);

            _afterUpdateInterceptorMock
                .Setup(i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request, It.IsAny<User>()))
                .Returns((Response<User, List<ValidationFailure>> r, UserRequest _, User __) => r);

            _entitySupportServiceMock
                .Setup(s => s.GetBeforeUpdateInterceptors<User, UserRequest>())
                .Returns(new[] { _beforeUpdateInterceptorMock.Object });
            _entitySupportServiceMock
                .Setup(s => s.GetAfterUpdateInterceptors<User, UserRequest>())
                .Returns(new[] { _afterUpdateInterceptorMock.Object });

            var service = CreateService();

            // Act
            service.Update(request);

            // Assert
            _beforeUpdateInterceptorMock.Verify(
                i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request),
                Times.Once);
            _afterUpdateInterceptorMock.Verify(
                i => i.Execute(It.IsAny<Response<User, List<ValidationFailure>>>(), request, It.IsAny<User>()),
                Times.Once);
        }

        [Fact]
        public void Update_ValidRequest_ReturnsResponseWithSuccessTrue()
        {
            // Arrange
            var existingUser = SeedExistingUser();
            var request = new UserRequest
            {
                Id = 1,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.Update(request);

            // Assert
            response.Success.Should().BeTrue();
        }

        #endregion

        #region Update - Non-existent Entity

        [Fact]
        public void Update_NonExistentEntity_ReturnsResponseWithSuccessFalse()
        {
            // Arrange - No entity seeded
            var request = new UserRequest
            {
                Id = 999,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.Update(request);

            // Assert
            response.Success.Should().BeFalse();
        }

        [Fact]
        public void Update_NonExistentEntity_ReturnsErrorsWithPropertyNameId()
        {
            // Arrange - No entity seeded
            var request = new UserRequest
            {
                Id = 999,
                Name = "Updated Name",
                Email = "updated@test.com",
                UserName = "updateduser",
                RolId = 1,
                CreatedBy = 1,
                UpdatedBy = 2,
                State = 1
            };

            var validationResult = new ValidationResult();
            _updateValidatorMock.Setup(v => v.Validate(request)).Returns(validationResult);
            _entitySupportServiceMock.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(_updateValidatorMock.Object);

            SetupMapperForUpdate();
            SetupNoInterceptors();

            var service = CreateService();

            // Act
            var response = service.Update(request);

            // Assert
            response.Errors.Should().NotBeNull();
            response.Errors.Should().Contain(e => e.PropertyName == "Id");
        }

        #endregion
    }
}
