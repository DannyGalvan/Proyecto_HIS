using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.userInterceptors;
using Hospital.Server.Tests.Infrastructure;
using Xunit;
using BC = BCrypt.Net;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class UserBeforeCreateInterceptorTests : TestBase
    {
        private readonly UserBeforeCreateInterceptor _sut;

        public UserBeforeCreateInterceptorTests()
        {
            _sut = new UserBeforeCreateInterceptor();
        }

        #region Hashes non-empty password with BCrypt

        [Fact]
        public void Execute_WithNonEmptyPassword_HashesPasswordWithBCrypt()
        {
            // Arrange
            const string plainPassword = "SecurePassword123!";
            var user = new User
            {
                Id = 0,
                Name = "Test User",
                Email = "test@hospital.com",
                UserName = "testuser",
                Password = string.Empty,
                IdentificationDocument = "1234567890123",
                Number = "55551234",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = user
            };

            var request = new UserRequest
            {
                Password = plainPassword,
                Name = "Test User",
                Email = "test@hospital.com",
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Password.Should().NotBe(plainPassword);
            result.Data.Password.Should().NotBeNullOrEmpty();
            BC.BCrypt.Verify(plainPassword, result.Data.Password).Should().BeTrue();
        }

        [Fact]
        public void Execute_WithNonEmptyPassword_ProducesDifferentHashEachTime()
        {
            // Arrange
            const string plainPassword = "MyPassword456!";
            var user1 = new User
            {
                Id = 0,
                Name = "User 1",
                Email = "user1@hospital.com",
                UserName = "user1",
                Password = string.Empty,
                IdentificationDocument = "1111111111111",
                Number = "55551111",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var user2 = new User
            {
                Id = 0,
                Name = "User 2",
                Email = "user2@hospital.com",
                UserName = "user2",
                Password = string.Empty,
                IdentificationDocument = "2222222222222",
                Number = "55552222",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response1 = new Response<User, List<ValidationFailure>> { Success = true, Data = user1 };
            var response2 = new Response<User, List<ValidationFailure>> { Success = true, Data = user2 };
            var request = new UserRequest { Password = plainPassword, CreatedBy = 1 };

            // Act
            var result1 = _sut.Execute(response1, request);
            var result2 = _sut.Execute(response2, request);

            // Assert - BCrypt uses random salt, so hashes should differ
            result1.Data!.Password.Should().NotBe(result2.Data!.Password);
            BC.BCrypt.Verify(plainPassword, result1.Data.Password).Should().BeTrue();
            BC.BCrypt.Verify(plainPassword, result2.Data.Password).Should().BeTrue();
        }

        #endregion

        #region Fails with null/empty password

        [Fact]
        public void Execute_WithNullPassword_FailsWithValidationError()
        {
            // Arrange
            var user = new User
            {
                Id = 0,
                Name = "Test User",
                Email = "test@hospital.com",
                UserName = "testuser",
                Password = string.Empty,
                IdentificationDocument = "1234567890123",
                Number = "55551234",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = user
            };

            var request = new UserRequest
            {
                Password = null,
                Name = "Test User",
                Email = "test@hospital.com",
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().NotBeNull();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Password");
        }

        [Fact]
        public void Execute_WithEmptyPassword_FailsWithValidationError()
        {
            // Arrange
            var user = new User
            {
                Id = 0,
                Name = "Test User",
                Email = "test@hospital.com",
                UserName = "testuser",
                Password = string.Empty,
                IdentificationDocument = "1234567890123",
                Number = "55551234",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = user
            };

            var request = new UserRequest
            {
                Password = "",
                Name = "Test User",
                Email = "test@hospital.com",
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().NotBeNull();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Password");
            result.Errors![0].ErrorMessage.Should().Contain("contraseña");
        }

        [Fact]
        public void Execute_WithNullData_DoesNotThrowAndReturnsResponse()
        {
            // Arrange
            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new UserRequest
            {
                Password = null,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert - null password check happens before Data check
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Password");
        }

        #endregion
    }

    public class UserBeforeUpdateInterceptorTests : TestBase
    {
        private readonly UserBeforeUpdateInterceptor _sut;

        public UserBeforeUpdateInterceptorTests()
        {
            _sut = new UserBeforeUpdateInterceptor();
        }

        #region Hashes non-empty password

        [Fact]
        public void Execute_WithNonEmptyPassword_HashesPasswordWithBCrypt()
        {
            // Arrange
            const string newPassword = "NewSecurePassword789!";
            var originalHash = BC.BCrypt.HashPassword("OldPassword123!");
            var user = new User
            {
                Id = 1,
                Name = "Existing User",
                Email = "existing@hospital.com",
                UserName = "existinguser",
                Password = originalHash,
                IdentificationDocument = "1234567890123",
                Number = "55551234",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = user
            };

            var request = new UserRequest
            {
                Id = 1,
                Password = newPassword,
                UpdatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Password.Should().NotBe(originalHash);
            result.Data.Password.Should().NotBe(newPassword);
            BC.BCrypt.Verify(newPassword, result.Data.Password).Should().BeTrue();
            BC.BCrypt.Verify("OldPassword123!", result.Data.Password).Should().BeFalse();
        }

        #endregion

        #region Preserves password when null/empty in request

        [Fact]
        public void Execute_WithNullPassword_PreservesExistingPassword()
        {
            // Arrange
            var originalHash = BC.BCrypt.HashPassword("OriginalPassword!");
            var user = new User
            {
                Id = 1,
                Name = "Existing User",
                Email = "existing@hospital.com",
                UserName = "existinguser",
                Password = originalHash,
                IdentificationDocument = "1234567890123",
                Number = "55551234",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = user
            };

            var request = new UserRequest
            {
                Id = 1,
                Password = null,
                UpdatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Password.Should().Be(originalHash);
            BC.BCrypt.Verify("OriginalPassword!", result.Data.Password).Should().BeTrue();
        }

        [Fact]
        public void Execute_WithEmptyPassword_PreservesExistingPassword()
        {
            // Arrange
            var originalHash = BC.BCrypt.HashPassword("OriginalPassword!");
            var user = new User
            {
                Id = 1,
                Name = "Existing User",
                Email = "existing@hospital.com",
                UserName = "existinguser",
                Password = originalHash,
                IdentificationDocument = "1234567890123",
                Number = "55551234",
                RolId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = user
            };

            var request = new UserRequest
            {
                Id = 1,
                Password = "",
                UpdatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Password.Should().Be(originalHash);
            BC.BCrypt.Verify("OriginalPassword!", result.Data.Password).Should().BeTrue();
        }

        [Fact]
        public void Execute_WithNullData_ReturnsResponseUnchanged()
        {
            // Arrange
            var response = new Response<User, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new UserRequest
            {
                Id = 1,
                Password = "SomePassword",
                UpdatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().BeNull();
        }

        #endregion
    }
}
