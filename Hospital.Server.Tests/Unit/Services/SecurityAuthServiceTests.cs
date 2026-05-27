using FluentAssertions;
using Hospital.Server.Configs.Models;
using Hospital.Server.Context;
using Hospital.Server.Entities.Dtos.Security;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Core;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using BC = BCrypt.Net;

namespace Hospital.Server.Tests.Unit.Services
{
    public class SecurityAuthServiceTests : TestBase
    {
        private readonly Mock<ILogger<SecurityAuthService>> _loggerMock;
        private readonly IOptions<AppSettings> _appSettings;
        private readonly SecurityAuthService _sut;

        public SecurityAuthServiceTests()
        {
            _loggerMock = new Mock<ILogger<SecurityAuthService>>();
            _appSettings = Options.Create(new AppSettings
            {
                Secret = "TestSecretKeyForSecurityAuthServiceTests1234567890!",
                TokenExpirationHrs = 8,
                NotBefore = 0,
                FrontendUrl = "http://localhost:3000"
            });

            _sut = new SecurityAuthService(DbContext, _loggerMock.Object, _appSettings);
        }

        #region ValidatePasswordPolicy

        [Fact]
        public void ValidatePasswordPolicy_WithValidPassword_ShouldReturnTrue()
        {
            // Act
            var result = _sut.ValidatePasswordPolicy("Str0ng@Pass", out string message);

            // Assert
            result.Should().BeTrue();
            message.Should().BeEmpty();
        }

        [Fact]
        public void ValidatePasswordPolicy_WithEmptyPassword_ShouldReturnFalse()
        {
            // Act
            var result = _sut.ValidatePasswordPolicy("", out string message);

            // Assert
            result.Should().BeFalse();
            message.Should().Contain("vacía");
        }

        [Fact]
        public void ValidatePasswordPolicy_WithWhitespace_ShouldReturnFalse()
        {
            // Act
            var result = _sut.ValidatePasswordPolicy("   ", out string message);

            // Assert
            result.Should().BeFalse();
            message.Should().Contain("vacía");
        }

        [Fact]
        public void ValidatePasswordPolicy_WithTooShortPassword_ShouldReturnFalse()
        {
            // Act - minimum is 8 characters
            var result = _sut.ValidatePasswordPolicy("Ab1@", out string message);

            // Assert
            result.Should().BeFalse();
            message.Should().Contain("8 caracteres");
        }

        [Fact]
        public void ValidatePasswordPolicy_WithoutUppercase_ShouldReturnFalse()
        {
            // Act
            var result = _sut.ValidatePasswordPolicy("lowercase1@pass", out string message);

            // Assert
            result.Should().BeFalse();
            message.Should().Contain("mayúscula");
        }

        [Fact]
        public void ValidatePasswordPolicy_WithoutLowercase_ShouldReturnFalse()
        {
            // Act
            var result = _sut.ValidatePasswordPolicy("UPPERCASE1@PASS", out string message);

            // Assert
            result.Should().BeFalse();
            message.Should().Contain("minúscula");
        }

        [Fact]
        public void ValidatePasswordPolicy_WithoutDigit_ShouldReturnFalse()
        {
            // Act
            var result = _sut.ValidatePasswordPolicy("NoDigits@Pass", out string message);

            // Assert
            result.Should().BeFalse();
            message.Should().Contain("número");
        }

        [Fact]
        public void ValidatePasswordPolicy_WithoutSpecialCharacter_ShouldReturnFalse()
        {
            // Act
            var result = _sut.ValidatePasswordPolicy("NoSpecial1Pass", out string message);

            // Assert
            result.Should().BeFalse();
            message.Should().Contain("especial");
        }

        #endregion

        #region ValidateCredentialsAsync

        [Fact]
        public async Task ValidateCredentialsAsync_WithNonExistentUser_ShouldThrowUnauthorized()
        {
            // Arrange
            var request = new SecurityLoginRequest
            {
                UserName = "nonexistent",
                Password = "password",
                IpAddress = "127.0.0.1",
                UserAgent = "TestAgent"
            };

            // Act
            var act = () => _sut.ValidateCredentialsAsync(request);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task ValidateCredentialsAsync_WithLockedAccount_ShouldThrowUnauthorized()
        {
            // Arrange
            var rol = new Rol { Id = 10, Name = "TestRole", State = 1, CreatedBy = 1 };
            DbContext.Roles.Add(rol);

            var user = new User
            {
                Id = 1,
                UserName = "lockeduser",
                Password = BC.BCrypt.HashPassword("password"),
                Name = "Locked User",
                Email = "locked@test.com",
                State = 1,
                RolId = 10,
                LockoutEnd = DateTime.Now.AddMinutes(30),
                FailedLoginAttempts = 5
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityLoginRequest
            {
                UserName = "lockeduser",
                Password = "password",
                IpAddress = "127.0.0.1"
            };

            // Act
            var act = () => _sut.ValidateCredentialsAsync(request);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*bloqueada*");
        }

        [Fact]
        public async Task ValidateCredentialsAsync_WithWrongPassword_ShouldThrowUnauthorized()
        {
            // Arrange
            var user = new User
            {
                Id = 2,
                UserName = "testuser",
                Password = BC.BCrypt.HashPassword("correctpassword"),
                Name = "Test User",
                Email = "test@test.com",
                State = 1,
                RolId = 1
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityLoginRequest
            {
                UserName = "testuser",
                Password = "wrongpassword",
                IpAddress = "127.0.0.1"
            };

            // Act
            var act = () => _sut.ValidateCredentialsAsync(request);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task ValidateCredentialsAsync_WithInactiveUser_ShouldThrowUnauthorized()
        {
            // Arrange
            var rol = new Rol { Id = 11, Name = "TestRole2", State = 1, CreatedBy = 1 };
            DbContext.Roles.Add(rol);

            var user = new User
            {
                Id = 3,
                UserName = "inactiveuser",
                Password = BC.BCrypt.HashPassword("password123"),
                Name = "Inactive User",
                Email = "inactive@test.com",
                State = 0, // inactive
                RolId = 11
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityLoginRequest
            {
                UserName = "inactiveuser",
                Password = "password123",
                IpAddress = "127.0.0.1"
            };

            // Act
            var act = () => _sut.ValidateCredentialsAsync(request);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*inactivo*");
        }

        [Fact]
        public async Task ValidateCredentialsAsync_WithValidCredentials_ShouldReturnAuthResult()
        {
            // Arrange
            var rol = new Rol { Id = 1, Name = "Admin", State = 1, CreatedBy = 1 };
            DbContext.Roles.Add(rol);

            var user = new User
            {
                Id = 4,
                UserName = "validuser",
                Password = BC.BCrypt.HashPassword("Valid1@Pass"),
                Name = "Valid User",
                Email = "valid@test.com",
                State = 1,
                RolId = 1,
                MustChangePassword = false
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityLoginRequest
            {
                UserName = "validuser",
                Password = "Valid1@Pass",
                IpAddress = "127.0.0.1",
                UserAgent = "TestAgent"
            };

            // Act
            var result = await _sut.ValidateCredentialsAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.UserName.Should().Be("validuser");
            result.FullName.Should().Be("Valid User");
            result.RequiresPasswordChange.Should().BeFalse();
        }

        [Fact]
        public async Task ValidateCredentialsAsync_WithExpiredPassword_ShouldRequirePasswordChange()
        {
            // Arrange
            var rol = new Rol { Id = 2, Name = "User", State = 1, CreatedBy = 1 };
            DbContext.Roles.Add(rol);

            var user = new User
            {
                Id = 5,
                UserName = "expiredpwd",
                Password = BC.BCrypt.HashPassword("Valid1@Pass"),
                Name = "Expired Pwd User",
                Email = "expired@test.com",
                State = 1,
                RolId = 2,
                MustChangePassword = false,
                LastPasswordChange = DateTime.Now.AddDays(-100) // > 90 days
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityLoginRequest
            {
                UserName = "expiredpwd",
                Password = "Valid1@Pass",
                IpAddress = "127.0.0.1"
            };

            // Act
            var result = await _sut.ValidateCredentialsAsync(request);

            // Assert
            result.RequiresPasswordChange.Should().BeTrue();
        }

        #endregion

        #region ChangePasswordAsync

        [Fact]
        public async Task ChangePasswordAsync_WithNonExistentUser_ShouldReturnFalse()
        {
            // Act
            var request = new SecurityChangePasswordRequest
            {
                CurrentPassword = "old",
                NewPassword = "New1@Pass",
                ConfirmPassword = "New1@Pass"
            };
            var result = await _sut.ChangePasswordAsync(999, request);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task ChangePasswordAsync_WithWrongCurrentPassword_ShouldReturnFalse()
        {
            // Arrange
            var user = new User
            {
                Id = 10,
                UserName = "changepwd",
                Password = BC.BCrypt.HashPassword("CurrentPass1@"),
                Name = "Change Pwd",
                Email = "change@test.com",
                State = 1,
                RolId = 1
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityChangePasswordRequest
            {
                CurrentPassword = "WrongPassword",
                NewPassword = "NewPass1@",
                ConfirmPassword = "NewPass1@"
            };

            // Act
            var result = await _sut.ChangePasswordAsync(10, request);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task ChangePasswordAsync_WithMismatchedConfirmation_ShouldReturnFalse()
        {
            // Arrange
            var user = new User
            {
                Id = 11,
                UserName = "mismatch",
                Password = BC.BCrypt.HashPassword("CurrentPass1@"),
                Name = "Mismatch User",
                Email = "mismatch@test.com",
                State = 1,
                RolId = 1
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityChangePasswordRequest
            {
                CurrentPassword = "CurrentPass1@",
                NewPassword = "NewPass1@",
                ConfirmPassword = "DifferentPass1@"
            };

            // Act
            var result = await _sut.ChangePasswordAsync(11, request);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task ChangePasswordAsync_WithWeakNewPassword_ShouldReturnFalse()
        {
            // Arrange
            var user = new User
            {
                Id = 12,
                UserName = "weakpwd",
                Password = BC.BCrypt.HashPassword("CurrentPass1@"),
                Name = "Weak Pwd User",
                Email = "weak@test.com",
                State = 1,
                RolId = 1
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityChangePasswordRequest
            {
                CurrentPassword = "CurrentPass1@",
                NewPassword = "weak", // too short, no special chars
                ConfirmPassword = "weak"
            };

            // Act
            var result = await _sut.ChangePasswordAsync(12, request);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task ChangePasswordAsync_WithValidRequest_ShouldReturnTrue()
        {
            // Arrange
            var user = new User
            {
                Id = 13,
                UserName = "validchange",
                Password = BC.BCrypt.HashPassword("OldPass1@"),
                Name = "Valid Change",
                Email = "validchange@test.com",
                State = 1,
                RolId = 1
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            var request = new SecurityChangePasswordRequest
            {
                CurrentPassword = "OldPass1@",
                NewPassword = "NewStr0ng@Pass",
                ConfirmPassword = "NewStr0ng@Pass"
            };

            // Act
            var result = await _sut.ChangePasswordAsync(13, request);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task ChangePasswordAsync_WithRecentlyUsedPassword_ShouldReturnFalse()
        {
            // Arrange
            var hashedOld = BC.BCrypt.HashPassword("OldPass1@");
            var hashedNew = BC.BCrypt.HashPassword("NewStr0ng@Pass");
            var user = new User
            {
                Id = 14,
                UserName = "reusedpwd",
                Password = BC.BCrypt.HashPassword("CurrentPass1@"),
                Name = "Reused Pwd",
                Email = "reused@test.com",
                State = 1,
                RolId = 1
            };
            DbContext.Users.Add(user);

            // Add password history with the "new" password
            DbContext.PasswordHistories.Add(new PasswordHistory
            {
                Id = 10,
                UserId = 14,
                PasswordHash = BC.BCrypt.HashPassword("NewStr0ng@Pass"),
                ChangedBy = 14,
                State = 1
            });
            await DbContext.SaveChangesAsync();

            var request = new SecurityChangePasswordRequest
            {
                CurrentPassword = "CurrentPass1@",
                NewPassword = "NewStr0ng@Pass",
                ConfirmPassword = "NewStr0ng@Pass"
            };

            // Act
            var result = await _sut.ChangePasswordAsync(14, request);

            // Assert
            result.Should().BeFalse();
        }

        #endregion

        #region SetPasswordAsync

        [Fact]
        public async Task SetPasswordAsync_WithNonExistentUser_ShouldThrow()
        {
            // Act
            var act = () => _sut.SetPasswordAsync(999, "NewPass1@", true);

            // Assert
            await act.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task SetPasswordAsync_WithValidUser_ShouldSetPassword()
        {
            // Arrange
            var user = new User
            {
                Id = 20,
                UserName = "setpwd",
                Password = BC.BCrypt.HashPassword("OldPass"),
                Name = "Set Pwd User",
                Email = "setpwd@test.com",
                State = 1,
                RolId = 1
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            // Act
            await _sut.SetPasswordAsync(20, "NewPassword1@", true);

            // Assert
            var updatedUser = await DbContext.Users.FindAsync(20L);
            updatedUser!.MustChangePassword.Should().BeTrue();
            BC.BCrypt.Verify("NewPassword1@", updatedUser.Password).Should().BeTrue();
        }

        #endregion

        #region IsAccountLockedAsync

        [Fact]
        public async Task IsAccountLockedAsync_WithNoLockout_ShouldReturnFalse()
        {
            // Arrange
            var user = new User
            {
                Id = 30,
                UserName = "unlocked",
                Password = "hash",
                Name = "Unlocked",
                Email = "unlocked@test.com",
                State = 1,
                RolId = 1,
                LockoutEnd = null
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _sut.IsAccountLockedAsync(30);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task IsAccountLockedAsync_WithActiveLockout_ShouldReturnTrue()
        {
            // Arrange
            var user = new User
            {
                Id = 31,
                UserName = "locked",
                Password = "hash",
                Name = "Locked",
                Email = "locked@test.com",
                State = 1,
                RolId = 1,
                LockoutEnd = DateTime.Now.AddMinutes(15)
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _sut.IsAccountLockedAsync(31);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task IsAccountLockedAsync_WithExpiredLockout_ShouldReturnFalseAndClear()
        {
            // Arrange
            var user = new User
            {
                Id = 32,
                UserName = "expiredlock",
                Password = "hash",
                Name = "Expired Lock",
                Email = "expiredlock@test.com",
                State = 1,
                RolId = 1,
                LockoutEnd = DateTime.Now.AddMinutes(-5),
                FailedLoginAttempts = 5
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _sut.IsAccountLockedAsync(32);

            // Assert
            result.Should().BeFalse();
            var updatedUser = await DbContext.Users.FindAsync(32L);
            updatedUser!.FailedLoginAttempts.Should().Be(0);
            updatedUser.LockoutEnd.Should().BeNull();
        }

        [Fact]
        public async Task IsAccountLockedAsync_WithNonExistentUser_ShouldReturnFalse()
        {
            // Act
            var result = await _sut.IsAccountLockedAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        #endregion

        #region IncrementFailedLoginAttemptsAsync

        [Fact]
        public async Task IncrementFailedLoginAttemptsAsync_ShouldIncrementCounter()
        {
            // Arrange
            var user = new User
            {
                Id = 40,
                UserName = "failattempt",
                Password = "hash",
                Name = "Fail Attempt",
                Email = "fail@test.com",
                State = 1,
                RolId = 1,
                FailedLoginAttempts = 0
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            // Act
            await _sut.IncrementFailedLoginAttemptsAsync(40);

            // Assert
            var updatedUser = await DbContext.Users.FindAsync(40L);
            updatedUser!.FailedLoginAttempts.Should().Be(1);
        }

        [Fact]
        public async Task IncrementFailedLoginAttemptsAsync_WhenReachingMax_ShouldLockAccount()
        {
            // Arrange
            var user = new User
            {
                Id = 41,
                UserName = "lockout",
                Password = "hash",
                Name = "Lockout User",
                Email = "lockout@test.com",
                State = 1,
                RolId = 1,
                FailedLoginAttempts = 4 // one more will trigger lockout (max is 5)
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            // Act
            await _sut.IncrementFailedLoginAttemptsAsync(41);

            // Assert
            var updatedUser = await DbContext.Users.FindAsync(41L);
            updatedUser!.FailedLoginAttempts.Should().Be(5);
            updatedUser.LockoutEnd.Should().NotBeNull();
            updatedUser.LockoutEnd.Should().BeAfter(DateTime.Now);
        }

        #endregion

        #region ResetFailedLoginAttemptsAsync

        [Fact]
        public async Task ResetFailedLoginAttemptsAsync_ShouldResetCounterAndLockout()
        {
            // Arrange
            var user = new User
            {
                Id = 50,
                UserName = "resetattempts",
                Password = "hash",
                Name = "Reset Attempts",
                Email = "reset@test.com",
                State = 1,
                RolId = 1,
                FailedLoginAttempts = 3,
                LockoutEnd = DateTime.Now.AddMinutes(10)
            };
            DbContext.Users.Add(user);
            await DbContext.SaveChangesAsync();

            // Act
            await _sut.ResetFailedLoginAttemptsAsync(50);

            // Assert
            var updatedUser = await DbContext.Users.FindAsync(50L);
            updatedUser!.FailedLoginAttempts.Should().Be(0);
            updatedUser.LockoutEnd.Should().BeNull();
        }

        #endregion

        #region RecordLoginAuditAsync

        [Fact]
        public async Task RecordLoginAuditAsync_ShouldCreateAuditEntry()
        {
            // Act
            await _sut.RecordLoginAuditAsync(1, "testuser", "192.168.1.1", "Chrome", true);

            // Assert
            var audits = DbContext.LoginAudits.Where(a => a.UserName == "testuser").ToList();
            audits.Should().HaveCount(1);
            audits[0].LoginSuccessful.Should().BeTrue();
            audits[0].IpAddress.Should().Be("192.168.1.1");
        }

        [Fact]
        public async Task RecordLoginAuditAsync_WithFailure_ShouldRecordReason()
        {
            // Act
            await _sut.RecordLoginAuditAsync(1, "failuser", "10.0.0.1", "Firefox", false, "Contraseña incorrecta");

            // Assert
            var audit = DbContext.LoginAudits.FirstOrDefault(a => a.UserName == "failuser");
            audit.Should().NotBeNull();
            audit!.LoginSuccessful.Should().BeFalse();
            audit.FailureReason.Should().Be("Contraseña incorrecta");
        }

        #endregion

        #region GetAllowedOperationsAsync

        [Fact]
        public async Task GetAllowedOperationsAsync_WithNoOperations_ShouldReturnEmptySet()
        {
            // Act
            var result = await _sut.GetAllowedOperationsAsync(999);

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetAllowedOperationsAsync_WithOperations_ShouldReturnOperationPolicies()
        {
            // Arrange
            var module = new Module { Id = 1, Name = "Users", State = 1, CreatedBy = 1, IsVisible = true };
            DbContext.Modules.Add(module);

            var operation = new Operation
            {
                Id = 1,
                Name = "GetAll",
                ModuleId = 1,
                ControllerName = "User",
                ActionName = "GetAll",
                HttpMethod = "GET",
                OperationKey = "User.GetAll.GET",
                Policy = "User.GetAll",
                IsVisible = true,
                State = 1,
                CreatedBy = 1
            };
            DbContext.Operations.Add(operation);

            var rolOperation = new RolOperation
            {
                Id = 1,
                RolId = 5,
                OperationId = 1,
                State = 1,
                IsVisible = true,
                CreatedBy = 1
            };
            DbContext.RolOperations.Add(rolOperation);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _sut.GetAllowedOperationsAsync(5);

            // Assert
            result.Should().NotBeEmpty();
            result.Should().Contain("User.GetAll");
        }

        #endregion

        #region IsPasswordRecentlyUsedAsync

        [Fact]
        public async Task IsPasswordRecentlyUsedAsync_WithNoHistory_ShouldReturnFalse()
        {
            // Act
            var result = await _sut.IsPasswordRecentlyUsedAsync(999, "SomePassword");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task IsPasswordRecentlyUsedAsync_WithMatchingHistory_ShouldReturnTrue()
        {
            // Arrange
            var hashedPassword = BC.BCrypt.HashPassword("ReusedPass1@");
            DbContext.PasswordHistories.Add(new PasswordHistory
            {
                Id = 1,
                UserId = 60,
                PasswordHash = hashedPassword,
                ChangedBy = 60,
                State = 1
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _sut.IsPasswordRecentlyUsedAsync(60, "ReusedPass1@");

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task IsPasswordRecentlyUsedAsync_WithNonMatchingHistory_ShouldReturnFalse()
        {
            // Arrange
            var hashedPassword = BC.BCrypt.HashPassword("OldPassword1@");
            DbContext.PasswordHistories.Add(new PasswordHistory
            {
                Id = 2,
                UserId = 61,
                PasswordHash = hashedPassword,
                ChangedBy = 61,
                State = 1
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _sut.IsPasswordRecentlyUsedAsync(61, "CompletelyDifferent1@");

            // Assert
            result.Should().BeFalse();
        }

        #endregion
    }
}
