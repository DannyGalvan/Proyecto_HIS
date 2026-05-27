using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Hospital.Server.Configs.Models;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using MapsterMapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using BC = BCrypt.Net;

namespace Hospital.Server.Tests.Unit.Services
{
    public class AuthServiceAdditionalTests : TestBase
    {
        private readonly Mock<IValidator<LoginRequest>> _loginValidatorMock;
        private readonly Mock<IValidator<ChangePasswordRequest>> _changePasswordValidatorMock;
        private readonly Mock<IValidator<ResetPasswordRequest>> _resetPasswordValidatorMock;
        private readonly Mock<IValidator<RecoveryPasswordRequest>> _recoveryPasswordValidatorMock;
        private readonly Mock<IValidator<RegisterRequest>> _registerValidatorMock;
        private readonly Mock<ISendMail> _sendMailMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly Mock<IValidator<ManualChangePasswordRequest>> _manualChangePasswordValidatorMock;
        private readonly IOptions<AppSettings> _appSettings;
        private readonly AuthService _authService;

        public AuthServiceAdditionalTests()
        {
            _loginValidatorMock = new Mock<IValidator<LoginRequest>>();
            _changePasswordValidatorMock = new Mock<IValidator<ChangePasswordRequest>>();
            _resetPasswordValidatorMock = new Mock<IValidator<ResetPasswordRequest>>();
            _recoveryPasswordValidatorMock = new Mock<IValidator<RecoveryPasswordRequest>>();
            _registerValidatorMock = new Mock<IValidator<RegisterRequest>>();
            _sendMailMock = new Mock<ISendMail>();
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<AuthService>>();
            _manualChangePasswordValidatorMock = new Mock<IValidator<ManualChangePasswordRequest>>();

            _appSettings = Options.Create(new AppSettings
            {
                Secret = "ThisIsAVeryLongSecretKeyForTestingPurposesOnly1234567890!",
                TokenExpirationHrs = 8,
                NotBefore = 0,
                FrontendUrl = "http://localhost:3000"
            });

            _authService = new AuthService(
                DbContext,
                _appSettings,
                _loginValidatorMock.Object,
                _changePasswordValidatorMock.Object,
                _resetPasswordValidatorMock.Object,
                _recoveryPasswordValidatorMock.Object,
                _registerValidatorMock.Object,
                _sendMailMock.Object,
                _mapperMock.Object,
                _loggerMock.Object,
                _manualChangePasswordValidatorMock.Object
            );
        }

        #region Register - Success

        [Fact]
        public void Register_WithValidData_ShouldReturnSuccess()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Name = "New Patient",
                Email = "newpatient@hospital.com",
                UserName = "newpatient",
                Password = "SecurePass123!",
                Number = "55551234",
                IdentificationDocument = "9876543210101"
            };

            _registerValidatorMock
                .Setup(v => v.Validate(It.IsAny<RegisterRequest>()))
                .Returns(new ValidationResult());

            _mapperMock
                .Setup(m => m.Map<RegisterRequest, User>(It.IsAny<RegisterRequest>()))
                .Returns(new User
                {
                    Name = "New Patient",
                    Email = "newpatient@hospital.com",
                    UserName = "newpatient",
                    Number = "55551234",
                    IdentificationDocument = "9876543210101"
                });

            // Act
            var result = _authService.Register(registerRequest);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Contain("Creado Correctamente");
            result.Data.Should().NotBeNull();
            result.Data!.RolId.Should().Be(2); // Patient role
        }

        [Fact]
        public void Register_WithValidationFailure_ShouldReturnFailure()
        {
            // Arrange
            var registerRequest = new RegisterRequest { Name = "", Email = "" };

            _registerValidatorMock
                .Setup(v => v.Validate(It.IsAny<RegisterRequest>()))
                .Returns(new ValidationResult(new List<ValidationFailure>
                {
                    new("Name", "Name is required")
                }));

            // Act
            var result = _authService.Register(registerRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().NotBeEmpty();
        }

        #endregion

        #region ResetPassword

        [Fact]
        public void ResetPassword_WithValidData_ShouldReturnSuccess()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, password: BC.BCrypt.HashPassword("old"));
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var request = new ResetPasswordRequest
            {
                IdUser = 1,
                Password = "NewPassword123!"
            };

            _resetPasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ResetPasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.ResetPassword(request);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Contain("Exitoso");
        }

        [Fact]
        public void ResetPassword_WithNonExistentUser_ShouldReturnFailure()
        {
            // Arrange
            var request = new ResetPasswordRequest
            {
                IdUser = 999,
                Password = "NewPassword123!"
            };

            _resetPasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ResetPasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.ResetPassword(request);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Contain("no encontrado");
        }

        [Fact]
        public void ResetPassword_WithValidationFailure_ShouldReturnFailure()
        {
            // Arrange
            var request = new ResetPasswordRequest { IdUser = 1, Password = "" };

            _resetPasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ResetPasswordRequest>()))
                .Returns(new ValidationResult(new List<ValidationFailure>
                {
                    new("Password", "Password is required")
                }));

            // Act
            var result = _authService.ResetPassword(request);

            // Assert
            result.Success.Should().BeFalse();
        }

        #endregion

        #region RecoveryPassword

        [Fact]
        public void RecoveryPassword_WithExistingEmail_ShouldSendEmailAndReturnSuccess()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, email: "patient@hospital.com");
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var request = new RecoveryPasswordRequest { Email = "patient@hospital.com" };

            _recoveryPasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<RecoveryPasswordRequest>()))
                .Returns(new ValidationResult());

            _sendMailMock
                .Setup(s => s.SendWithTemplate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<EmailTemplateType>(), It.IsAny<Dictionary<string, string>>()))
                .Returns(true);

            // Act
            var result = _authService.RecoveryPassword(request);

            // Assert
            result.Success.Should().BeTrue();
            _sendMailMock.Verify(s => s.SendWithTemplate(
                "patient@hospital.com",
                It.IsAny<string>(),
                It.IsAny<EmailTemplateType>(),
                It.IsAny<Dictionary<string, string>>()), Times.Once);
        }

        [Fact]
        public void RecoveryPassword_WithNonExistentEmail_ShouldReturnSuccessWithoutRevealingInfo()
        {
            // Arrange
            var request = new RecoveryPasswordRequest { Email = "nonexistent@hospital.com" };

            _recoveryPasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<RecoveryPasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.RecoveryPassword(request);

            // Assert
            result.Success.Should().BeTrue(); // doesn't reveal if email exists
            _sendMailMock.Verify(s => s.SendWithTemplate(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<EmailTemplateType>(), It.IsAny<Dictionary<string, string>>()), Times.Never);
        }

        [Fact]
        public void RecoveryPassword_WhenEmailFails_ShouldReturnFailure()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(id: 1, email: "fail@hospital.com");
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var request = new RecoveryPasswordRequest { Email = "fail@hospital.com" };

            _recoveryPasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<RecoveryPasswordRequest>()))
                .Returns(new ValidationResult());

            _sendMailMock
                .Setup(s => s.SendWithTemplate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<EmailTemplateType>(), It.IsAny<Dictionary<string, string>>()))
                .Returns(false);

            // Act
            var result = _authService.RecoveryPassword(request);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Contain("Error al enviar");
        }

        [Fact]
        public void RecoveryPassword_WithValidationFailure_ShouldReturnFailure()
        {
            // Arrange
            var request = new RecoveryPasswordRequest { Email = "" };

            _recoveryPasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<RecoveryPasswordRequest>()))
                .Returns(new ValidationResult(new List<ValidationFailure>
                {
                    new("Email", "Email is required")
                }));

            // Act
            var result = _authService.RecoveryPassword(request);

            // Assert
            result.Success.Should().BeFalse();
        }

        #endregion

        #region ManualChangePassword - Success

        [Fact]
        public void ManualChangePassword_WithValidData_ShouldReturnSuccess()
        {
            // Arrange
            const string currentPassword = "CurrentPass123!";
            var user = TestDataFactory.CreateUser(
                id: 1,
                password: BC.BCrypt.HashPassword(currentPassword));
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var request = new ManualChangePasswordRequest
            {
                UserId = 1,
                CurrentPassword = currentPassword,
                NewPassword = "NewSecure456!",
                ConfirmPassword = "NewSecure456!"
            };

            _manualChangePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ManualChangePasswordRequest>()))
                .Returns(new ValidationResult());

            _sendMailMock
                .Setup(s => s.SendWithTemplate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<EmailTemplateType>(), It.IsAny<Dictionary<string, string>>()))
                .Returns(true);

            // Act
            var result = _authService.ManualChangePassword(request);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Contain("actualizada correctamente");
        }

        [Fact]
        public void ManualChangePassword_WithNonExistentUser_ShouldReturnFailure()
        {
            // Arrange
            var request = new ManualChangePasswordRequest
            {
                UserId = 999,
                CurrentPassword = "pass",
                NewPassword = "NewPass123!",
                ConfirmPassword = "NewPass123!"
            };

            _manualChangePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ManualChangePasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.ManualChangePassword(request);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Contain("no encontrado");
        }

        [Fact]
        public void ManualChangePassword_WithValidationFailure_ShouldReturnFailure()
        {
            // Arrange
            var request = new ManualChangePasswordRequest();

            _manualChangePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ManualChangePasswordRequest>()))
                .Returns(new ValidationResult(new List<ValidationFailure>
                {
                    new("NewPassword", "Required")
                }));

            // Act
            var result = _authService.ManualChangePassword(request);

            // Assert
            result.Success.Should().BeFalse();
        }

        #endregion

        #region ValidateToken - Valid Token

        [Fact]
        public void ValidateToken_WithValidToken_ShouldReturnSuccess()
        {
            // Arrange
            const string token = "valid-token-123";
            var user = TestDataFactory.CreateUser(id: 1);
            user.RecoveryToken = token;
            user.DateToken = DateTime.UtcNow.AddMinutes(-5); // 5 minutes ago, within 15 min limit
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            // Act
            var result = _authService.ValidateToken(token);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Contain("Válido");
        }

        #endregion

        #region ChangePassword - Mismatched Passwords

        [Fact]
        public void ChangePassword_WithMismatchedPasswords_ShouldReturnFailure()
        {
            // Arrange
            const string recoveryToken = "mismatch-token";
            var user = TestDataFactory.CreateUser(id: 1, password: BC.BCrypt.HashPassword("old"));
            user.RecoveryToken = recoveryToken;
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var request = new ChangePasswordRequest
            {
                Token = recoveryToken,
                Password = "NewPass123!",
                ConfirmPassword = "DifferentPass456!"
            };

            _changePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ChangePasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.ChangePassword(request);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Contain("no coinciden");
        }

        [Fact]
        public void ChangePassword_WithValidationFailure_ShouldReturnFailure()
        {
            // Arrange
            var request = new ChangePasswordRequest { Token = "", Password = "" };

            _changePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ChangePasswordRequest>()))
                .Returns(new ValidationResult(new List<ValidationFailure>
                {
                    new("Password", "Required")
                }));

            // Act
            var result = _authService.ChangePassword(request);

            // Assert
            result.Success.Should().BeFalse();
        }

        #endregion
    }
}
