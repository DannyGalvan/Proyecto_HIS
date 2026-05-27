using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Hospital.Server.Configs.Models;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using BC = BCrypt.Net;

namespace Hospital.Server.Tests.Unit.Services
{
    public class AuthServiceTests : TestBase
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

        private const string JwtSecret = "ThisIsAVeryLongSecretKeyForTestingPurposesOnly1234567890!";

        public AuthServiceTests()
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
                Secret = JwtSecret,
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

        #region Auth - Valid Credentials

        [Fact]
        public void Auth_WithValidCredentials_ReturnsSuccessWithJwtContainingRequiredClaims()
        {
            // Arrange
            const string plainPassword = "TestPassword123!";
            var hashedPassword = BC.BCrypt.HashPassword(plainPassword);

            var rol = new Rol
            {
                Id = 1,
                Name = "Administrador",
                Description = "Rol de administrador",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var module = new Module
            {
                Id = 1,
                Name = "Users",
                Description = "Gestión de usuarios",
                Image = "users",
                Path = "Users",
                IsVisible = true,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var operation = new Operation
            {
                Id = 10,
                Name = "GetAll",
                ModuleId = 1,
                ControllerName = "User",
                ActionName = "GetAll",
                HttpMethod = "GET",
                OperationKey = "User.GetAll.GET",
                IsVisible = true,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var user = TestDataFactory.CreateUser(
                id: 1,
                name: "Danny Admin",
                email: "danny@hospital.com",
                userName: "dannyadmin",
                password: hashedPassword,
                rolId: 1
            );

            var rolOperation = new RolOperation
            {
                Id = 1,
                RolId = 1,
                OperationId = 10,
                State = 1,
                IsVisible = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1,
                Operation = operation
            };

            DbContext.Roles.Add(rol);
            DbContext.Modules.Add(module);
            DbContext.Operations.Add(operation);
            DbContext.Users.Add(user);
            DbContext.RolOperations.Add(rolOperation);
            DbContext.SaveChanges();

            var loginRequest = new LoginRequest
            {
                UserName = "dannyadmin",
                Password = plainPassword
            };

            _loginValidatorMock
                .Setup(v => v.Validate(It.IsAny<LoginRequest>()))
                .Returns(new ValidationResult());

            _mapperMock
                .Setup(m => m.Map<List<RolOperation>, List<Operation>>(It.IsAny<List<RolOperation>>()))
                .Returns([operation]);

            _mapperMock
                .Setup(m => m.Map<Module, ModuleResponse>(It.IsAny<Module>()))
                .Returns(new ModuleResponse());

            _mapperMock
                .Setup(m => m.Map<List<Operation>, List<OperationResponse>>(It.IsAny<List<Operation>>()))
                .Returns([]);

            _mapperMock
                .Setup(m => m.Map<User, AuthResponse>(It.IsAny<User>()))
                .Returns(new AuthResponse
                {
                    Name = "Danny Admin",
                    UserName = "dannyadmin",
                    Email = "danny@hospital.com",
                    UserId = 1,
                    Rol = 1
                });

            // Act
            var result = _authService.Auth(loginRequest);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Be("Inicio de sesión exitosa");
            result.Data.Should().NotBeNull();
            result.Data!.Token.Should().NotBeNullOrEmpty();

            // Decode the JWT and verify claims
            // Note: JwtSecurityTokenHandler maps standard claim URIs to short names
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(result.Data.Token);

            jwtToken.Claims.Should().Contain(c => c.Type == "nameid" && c.Value == "1");
            jwtToken.Claims.Should().Contain(c => c.Type == "email" && c.Value == "danny@hospital.com");
            jwtToken.Claims.Should().Contain(c => c.Type == "unique_name" && c.Value == "Danny Admin");
            jwtToken.Claims.Should().Contain(c => c.Type == "Operator" && c.Value == "1");
            jwtToken.Claims.Should().Contain(c => c.Type == "RoleName" && c.Value == "Administrador");
            jwtToken.Claims.Should().Contain(c => c.Type == "role");
        }

        #endregion

        #region Auth - Invalid Credentials

        [Fact]
        public void Auth_WithInvalidUsername_ReturnsFailureWithGenericMessage()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                UserName = "nonexistent",
                Password = "SomePassword123!"
            };

            _loginValidatorMock
                .Setup(v => v.Validate(It.IsAny<LoginRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.Auth(loginRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Usuario y/o contraseña invalidos");
            result.Data.Should().BeNull();
        }

        [Fact]
        public void Auth_WithInvalidPassword_ReturnsFailureWithGenericMessage()
        {
            // Arrange
            const string plainPassword = "CorrectPassword123!";
            var hashedPassword = BC.BCrypt.HashPassword(plainPassword);

            var rol = new Rol
            {
                Id = 1,
                Name = "Administrador",
                Description = "Rol admin",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var user = TestDataFactory.CreateUser(
                id: 1,
                name: "Test User",
                email: "test@hospital.com",
                userName: "testuser",
                password: hashedPassword,
                rolId: 1
            );

            DbContext.Roles.Add(rol);
            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var loginRequest = new LoginRequest
            {
                UserName = "testuser",
                Password = "WrongPassword123!"
            };

            _loginValidatorMock
                .Setup(v => v.Validate(It.IsAny<LoginRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.Auth(loginRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Usuario y/o contraseña invalidos");
            result.Data.Should().BeNull();
        }

        [Fact]
        public void Auth_WithValidationFailure_ReturnsFailureWithGenericMessage()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                UserName = "",
                Password = ""
            };

            var validationFailures = new List<ValidationFailure>
            {
                new("UserName", "UserName is required"),
                new("Password", "Password is required")
            };

            _loginValidatorMock
                .Setup(v => v.Validate(It.IsAny<LoginRequest>()))
                .Returns(new ValidationResult(validationFailures));

            // Act
            var result = _authService.Auth(loginRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Usuario y/o contraseña invalidos");
            result.Data.Should().BeNull();
            result.Errors.Should().NotBeNull();
            result.Errors.Should().HaveCount(2);
        }

        #endregion

        #region Register - Duplicate Username/Email

        [Fact]
        public void Register_WithDuplicateUsername_ReturnsFailure()
        {
            // Arrange
            var existingUser = TestDataFactory.CreateUser(
                id: 1,
                name: "Existing User",
                email: "existing@hospital.com",
                userName: "existinguser"
            );

            DbContext.Users.Add(existingUser);
            DbContext.SaveChanges();

            var registerRequest = new RegisterRequest
            {
                Name = "New User",
                Email = "new@hospital.com",
                UserName = "existinguser", // Duplicate username
                Password = "NewPassword123!",
                Number = "12345678",
                IdentificationDocument = "1234567890101"
            };

            _registerValidatorMock
                .Setup(v => v.Validate(It.IsAny<RegisterRequest>()))
                .Returns(new ValidationResult());

            _mapperMock
                .Setup(m => m.Map<RegisterRequest, User>(It.IsAny<RegisterRequest>()))
                .Returns(new User
                {
                    Name = "New User",
                    Email = "new@hospital.com",
                    UserName = "existinguser"
                });

            // Act
            var result = _authService.Register(registerRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("El usuario ya existe en la plataforma");
            result.Data.Should().BeNull();
        }

        [Fact]
        public void Register_WithDuplicateEmail_ReturnsFailure()
        {
            // Arrange
            var existingUser = TestDataFactory.CreateUser(
                id: 1,
                name: "Existing User",
                email: "existing@hospital.com",
                userName: "existinguser"
            );

            DbContext.Users.Add(existingUser);
            DbContext.SaveChanges();

            var registerRequest = new RegisterRequest
            {
                Name = "New User",
                Email = "existing@hospital.com", // Duplicate email
                UserName = "newuser",
                Password = "NewPassword123!",
                Number = "12345678",
                IdentificationDocument = "9876543210101"
            };

            _registerValidatorMock
                .Setup(v => v.Validate(It.IsAny<RegisterRequest>()))
                .Returns(new ValidationResult());

            _mapperMock
                .Setup(m => m.Map<RegisterRequest, User>(It.IsAny<RegisterRequest>()))
                .Returns(new User
                {
                    Name = "New User",
                    Email = "existing@hospital.com",
                    UserName = "newuser"
                });

            // Act
            var result = _authService.Register(registerRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("El usuario ya existe en la plataforma");
            result.Data.Should().BeNull();
        }

        #endregion

        #region JWT Token Generation - All Required Claims

        [Fact]
        public void Auth_WithValidCredentials_JwtContainsAllRequiredClaims()
        {
            // Arrange
            const string plainPassword = "SecurePass123!";
            var hashedPassword = BC.BCrypt.HashPassword(plainPassword);

            var rol = new Rol
            {
                Id = 2,
                Name = "Doctor",
                Description = "Rol de doctor",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var module = new Module
            {
                Id = 1,
                Name = "Appointments",
                Description = "Gestión de citas",
                Image = "calendar",
                Path = "Appointments",
                IsVisible = true,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var operation1 = new Operation
            {
                Id = 20,
                Name = "GetAll",
                ModuleId = 1,
                ControllerName = "Appointment",
                ActionName = "GetAll",
                HttpMethod = "GET",
                OperationKey = "Appointment.GetAll.GET",
                IsVisible = true,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var operation2 = new Operation
            {
                Id = 21,
                Name = "Create",
                ModuleId = 1,
                ControllerName = "Appointment",
                ActionName = "Create",
                HttpMethod = "POST",
                OperationKey = "Appointment.Create.POST",
                IsVisible = true,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var user = TestDataFactory.CreateUser(
                id: 5,
                name: "Dr. García",
                email: "garcia@hospital.com",
                userName: "drgarcia",
                password: hashedPassword,
                rolId: 2
            );

            var rolOperation1 = new RolOperation
            {
                Id = 1,
                RolId = 2,
                OperationId = 20,
                State = 1,
                IsVisible = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1,
                Operation = operation1
            };

            var rolOperation2 = new RolOperation
            {
                Id = 2,
                RolId = 2,
                OperationId = 21,
                State = 1,
                IsVisible = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1,
                Operation = operation2
            };

            DbContext.Roles.Add(rol);
            DbContext.Modules.Add(module);
            DbContext.Operations.AddRange(operation1, operation2);
            DbContext.Users.Add(user);
            DbContext.RolOperations.AddRange(rolOperation1, rolOperation2);
            DbContext.SaveChanges();

            var loginRequest = new LoginRequest
            {
                UserName = "drgarcia",
                Password = plainPassword
            };

            _loginValidatorMock
                .Setup(v => v.Validate(It.IsAny<LoginRequest>()))
                .Returns(new ValidationResult());

            _mapperMock
                .Setup(m => m.Map<List<RolOperation>, List<Operation>>(It.IsAny<List<RolOperation>>()))
                .Returns([operation1, operation2]);

            _mapperMock
                .Setup(m => m.Map<Module, ModuleResponse>(It.IsAny<Module>()))
                .Returns(new ModuleResponse());

            _mapperMock
                .Setup(m => m.Map<List<Operation>, List<OperationResponse>>(It.IsAny<List<Operation>>()))
                .Returns([]);

            _mapperMock
                .Setup(m => m.Map<User, AuthResponse>(It.IsAny<User>()))
                .Returns(new AuthResponse
                {
                    Name = "Dr. García",
                    UserName = "drgarcia",
                    Email = "garcia@hospital.com",
                    UserId = 5,
                    Rol = 2
                });

            // Act
            var result = _authService.Auth(loginRequest);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Token.Should().NotBeNullOrEmpty();

            // Decode JWT and verify ALL required claims
            // Note: JwtSecurityTokenHandler maps standard claim URIs to short names
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(result.Data.Token);

            // NameIdentifier claim (mapped to "nameid" in JWT)
            jwtToken.Claims.Should().Contain(c =>
                c.Type == "nameid" && c.Value == "5");

            // Email claim (mapped to "email" in JWT)
            jwtToken.Claims.Should().Contain(c =>
                c.Type == "email" && c.Value == "garcia@hospital.com");

            // Name claim (mapped to "unique_name" in JWT)
            jwtToken.Claims.Should().Contain(c =>
                c.Type == "unique_name" && c.Value == "Dr. García");

            // Hash claim (full URI in JWT)
            jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Actort || c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/hash");
            var hashClaim = jwtToken.Claims.First(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/hash");
            hashClaim.Value.Should().NotBeNullOrEmpty();

            // Operator claim (RolId)
            jwtToken.Claims.Should().Contain(c =>
                c.Type == "Operator" && c.Value == "2");

            // RoleName claim
            jwtToken.Claims.Should().Contain(c =>
                c.Type == "RoleName" && c.Value == "Doctor");

            // Role claims (operation IDs, mapped to "role" in JWT)
            var roleClaims = jwtToken.Claims.Where(c => c.Type == "role").ToList();
            roleClaims.Should().Contain(c => c.Value == "20");
            roleClaims.Should().Contain(c => c.Value == "21");

            // OperationKey claims
            var operationKeyClaims = jwtToken.Claims.Where(c => c.Type == "OperationKey").ToList();
            operationKeyClaims.Should().Contain(c => c.Value == "Appointment.GetAll.GET");
            operationKeyClaims.Should().Contain(c => c.Value == "Appointment.Create.POST");
        }

        #endregion

        #region ChangePassword - Valid Recovery Token and Matching Passwords

        [Fact]
        public void ChangePassword_WithValidRecoveryTokenAndMatchingPasswords_UpdatesPasswordClearsTokenAndSetsResetFalse()
        {
            // Arrange
            const string currentPassword = "OldPassword123!";
            var hashedCurrentPassword = BC.BCrypt.HashPassword(currentPassword);
            const string recoveryToken = "valid-recovery-token-abc123";

            var user = TestDataFactory.CreateUser(
                id: 1,
                name: "Test User",
                email: "test@hospital.com",
                userName: "testuser",
                password: hashedCurrentPassword
            );
            user.RecoveryToken = recoveryToken;
            user.Reset = true;
            user.DateToken = DateTime.UtcNow.AddMinutes(-5);

            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var changePasswordRequest = new ChangePasswordRequest
            {
                Token = recoveryToken,
                Password = "NewSecurePassword456!",
                ConfirmPassword = "NewSecurePassword456!"
            };

            _changePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ChangePasswordRequest>()))
                .Returns(new ValidationResult());

            _sendMailMock
                .Setup(s => s.SendWithTemplate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<EmailTemplateType>(), It.IsAny<Dictionary<string, string>>()))
                .Returns(true);

            // Act
            var result = _authService.ChangePassword(changePasswordRequest);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Be("Cambio de Contraseña Exitoso");

            var updatedUser = DbContext.Users.First(u => u.Id == 1);
            BC.BCrypt.Verify("NewSecurePassword456!", updatedUser.Password).Should().BeTrue();
            updatedUser.RecoveryToken.Should().BeEmpty();
            updatedUser.Reset.Should().BeFalse();
        }

        #endregion

        #region ManualChangePassword - Incorrect Current Password

        [Fact]
        public void ManualChangePassword_WithIncorrectCurrentPassword_ReturnsFailure()
        {
            // Arrange
            const string actualPassword = "CorrectPassword123!";
            var hashedPassword = BC.BCrypt.HashPassword(actualPassword);

            var user = TestDataFactory.CreateUser(
                id: 1,
                name: "Test User",
                email: "test@hospital.com",
                userName: "testuser",
                password: hashedPassword
            );

            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var manualChangeRequest = new ManualChangePasswordRequest
            {
                UserId = 1,
                CurrentPassword = "WrongPassword999!",
                NewPassword = "BrandNewPass456!",
                ConfirmPassword = "BrandNewPass456!"
            };

            _manualChangePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ManualChangePasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.ManualChangePassword(manualChangeRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("La contraseña actual es incorrecta.");
        }

        #endregion

        #region ValidateToken - Expired Token (>15 min)

        [Fact]
        public void ValidateToken_WithExpiredToken_ReturnsFailure()
        {
            // Arrange
            const string recoveryToken = "expired-token-xyz789";

            var user = TestDataFactory.CreateUser(
                id: 1,
                name: "Test User",
                email: "test@hospital.com",
                userName: "testuser"
            );
            user.RecoveryToken = recoveryToken;
            user.DateToken = DateTime.UtcNow.AddMinutes(-20); // 20 minutes ago, exceeds 15 min limit

            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            // Act
            var result = _authService.ValidateToken(recoveryToken);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Tu Token ya ha Expirado");
        }

        #endregion

        #region ChangePassword - Same Password as Current

        [Fact]
        public void ChangePassword_WithSamePasswordAsCurrent_ReturnsFailure()
        {
            // Arrange
            const string currentPassword = "SamePassword123!";
            var hashedCurrentPassword = BC.BCrypt.HashPassword(currentPassword);
            const string recoveryToken = "valid-token-for-same-pass";

            var user = TestDataFactory.CreateUser(
                id: 1,
                name: "Test User",
                email: "test@hospital.com",
                userName: "testuser",
                password: hashedCurrentPassword
            );
            user.RecoveryToken = recoveryToken;
            user.Reset = true;
            user.DateToken = DateTime.UtcNow.AddMinutes(-5);

            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            var changePasswordRequest = new ChangePasswordRequest
            {
                Token = recoveryToken,
                Password = currentPassword, // Same as current password
                ConfirmPassword = currentPassword
            };

            _changePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ChangePasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.ChangePassword(changePasswordRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("La nueva contraseña debe ser distinta a la contraseña anterior");
        }

        #endregion

        #region ChangePassword - Non-Existent Recovery Token

        [Fact]
        public void ChangePassword_WithNonExistentRecoveryToken_ReturnsFailure()
        {
            // Arrange
            var changePasswordRequest = new ChangePasswordRequest
            {
                Token = "non-existent-token-abc",
                Password = "NewPassword123!",
                ConfirmPassword = "NewPassword123!"
            };

            _changePasswordValidatorMock
                .Setup(v => v.Validate(It.IsAny<ChangePasswordRequest>()))
                .Returns(new ValidationResult());

            // Act
            var result = _authService.ChangePassword(changePasswordRequest);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("El token no es valido");
        }

        #endregion

        #region ValidateToken - Non-Matching Token

        [Fact]
        public void ValidateToken_WithNonMatchingToken_ReturnsFailure()
        {
            // Arrange
            var user = TestDataFactory.CreateUser(
                id: 1,
                name: "Test User",
                email: "test@hospital.com",
                userName: "testuser"
            );
            user.RecoveryToken = "actual-stored-token";
            user.DateToken = DateTime.UtcNow.AddMinutes(-5);

            DbContext.Users.Add(user);
            DbContext.SaveChanges();

            // Act - pass a token that doesn't match any user's RecoveryToken
            var result = _authService.ValidateToken("completely-different-token");

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Su Token ya ha Expirado");
        }

        #endregion
    }
}
