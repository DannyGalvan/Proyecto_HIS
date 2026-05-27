using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using FluentAssertions;
using Hospital.Server.Configs.Models;
using Hospital.Server.Context;
using Hospital.Server.Security.Authorization;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Xunit;
using Microsoft.IdentityModel.Tokens;
using Moq;

namespace Hospital.Server.Tests.Integration.Security;

/// <summary>
/// Integration tests for JWT and policy-based authorization.
/// Validates Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.7
/// </summary>
public class AuthorizationIntegrationTests : IDisposable
{
    private const string TestSecret = "ThisIsATestSecretKeyThatIsLongEnoughForHmacSha256Algorithm!";

    /// <summary>
    /// Test valid JWT with matching OperationKey returns 200.
    /// The Rol controller uses [RequireOperation] which builds the key as "Rol.GetAll.GET".
    /// Validates: Requirement 14.1
    /// </summary>
    [Fact]
    public async Task ValidJwt_WithMatchingOperationKey_Returns200()
    {
        // Arrange - configure test auth with the correct operation key for Rol.GetAll.GET
        await using var factory = new HospitalWebApplicationFactory()
            .WithOperationKeys("Rol.GetAll.GET");

        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/v1/Rol?PageNumber=1&PageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    /// <summary>
    /// Test valid JWT without matching OperationKey returns 403.
    /// The user is authenticated but doesn't have the required operation key.
    /// Validates: Requirement 14.2
    /// </summary>
    [Fact]
    public async Task ValidJwt_WithoutMatchingOperationKey_Returns403()
    {
        // Arrange - configure test auth with a different operation key
        await using var factory = new HospitalWebApplicationFactory()
            .WithOperationKeys("User.GetAll.GET");

        var client = factory.CreateClient();

        // Act - try to access Rol endpoint which requires "Rol.GetAll.GET"
        var response = await client.GetAsync("/api/v1/Rol?PageNumber=1&PageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    /// <summary>
    /// Test valid JWT with no OperationKey claims returns 403.
    /// The user is authenticated but has zero operation key claims.
    /// Validates: Requirement 14.3
    /// </summary>
    [Fact]
    public async Task ValidJwt_WithNoOperationKeyClaims_Returns403()
    {
        // Arrange - configure test auth with no operation keys
        await using var factory = new HospitalWebApplicationFactory()
            .WithOperationKeys();

        var client = factory.CreateClient();

        // Act - try to access Rol endpoint which requires "Rol.GetAll.GET"
        var response = await client.GetAsync("/api/v1/Rol?PageNumber=1&PageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    /// <summary>
    /// Test expired JWT returns 401 with "Token-Expired" header.
    /// Uses real JWT validation (not test auth handler) to verify expired token behavior.
    /// Validates: Requirement 14.4
    /// </summary>
    [Fact]
    public async Task ExpiredJwt_Returns401_WithTokenExpiredHeader()
    {
        // Arrange - use a factory with real JWT validation
        await using var factory = new RealJwtWebApplicationFactory(TestSecret);
        var client = factory.CreateClient();

        // Generate an expired JWT token
        var expiredToken = GenerateJwtToken(TestSecret, expired: true);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", expiredToken);

        // Act
        var response = await client.GetAsync("/api/v1/Rol?PageNumber=1&PageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        response.Headers.Contains("Token-Expired").Should().BeTrue();
        response.Headers.GetValues("Token-Expired").First().Should().Be("true");
    }

    /// <summary>
    /// Test missing Authorization header returns 401.
    /// Uses real JWT validation to verify unauthenticated request behavior.
    /// Validates: Requirement 14.5
    /// </summary>
    [Fact]
    public async Task MissingAuthorizationHeader_Returns401()
    {
        // Arrange - use a factory with real JWT validation (no test auth handler)
        await using var factory = new RealJwtWebApplicationFactory(TestSecret);
        var client = factory.CreateClient();

        // Act - send request without Authorization header
        var response = await client.GetAsync("/api/v1/Rol?PageNumber=1&PageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    /// <summary>
    /// Test OperationAuthorizationHandler calls context.Succeed only when OperationKey claims
    /// contain the requirement using case-insensitive comparison.
    /// Validates: Requirement 14.7
    /// </summary>
    [Fact]
    public async Task OperationAuthorizationHandler_Succeeds_WhenOperationKeyMatchesCaseInsensitive()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<OperationAuthorizationHandler>>();
        var handler = new OperationAuthorizationHandler(loggerMock.Object);

        // Create claims with lowercase operation key
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "1"),
            new("OperationKey", "rol.getall.get") // lowercase
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        // Requirement with mixed case
        var requirement = new OperationAuthorizationRequirement("Rol.GetAll.GET");
        var context = new AuthorizationHandlerContext(
            [requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert - should succeed because comparison is case-insensitive
        context.HasSucceeded.Should().BeTrue();
    }

    /// <summary>
    /// Test OperationAuthorizationHandler does NOT call context.Succeed when OperationKey claims
    /// do not contain the requirement.
    /// Validates: Requirement 14.7
    /// </summary>
    [Fact]
    public async Task OperationAuthorizationHandler_DoesNotSucceed_WhenOperationKeyDoesNotMatch()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<OperationAuthorizationHandler>>();
        var handler = new OperationAuthorizationHandler(loggerMock.Object);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "1"),
            new("OperationKey", "User.GetAll.GET")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        var requirement = new OperationAuthorizationRequirement("Rol.GetAll.GET");
        var context = new AuthorizationHandlerContext(
            [requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert - should NOT succeed
        context.HasSucceeded.Should().BeFalse();
    }

    /// <summary>
    /// Test OperationAuthorizationHandler does NOT call context.Succeed when user has no
    /// OperationKey claims at all.
    /// Validates: Requirement 14.7
    /// </summary>
    [Fact]
    public async Task OperationAuthorizationHandler_DoesNotSucceed_WhenNoOperationKeyClaims()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<OperationAuthorizationHandler>>();
        var handler = new OperationAuthorizationHandler(loggerMock.Object);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "1"),
            new(ClaimTypes.Email, "test@test.com")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        var requirement = new OperationAuthorizationRequirement("Rol.GetAll.GET");
        var context = new AuthorizationHandlerContext(
            [requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert - should NOT succeed
        context.HasSucceeded.Should().BeFalse();
    }

    public void Dispose()
    {
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Generates a JWT token for testing purposes.
    /// </summary>
    private static string GenerateJwtToken(string secret, bool expired = false)
    {
        var key = Encoding.ASCII.GetBytes(secret);
        var tokenHandler = new JwtSecurityTokenHandler();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "1"),
            new(ClaimTypes.Email, "test@hospital.com"),
            new(ClaimTypes.Name, "Test User"),
            new("RoleName", "SA"),
            new("OperationKey", "Rol.GetAll.GET")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            NotBefore = expired
                ? DateTime.UtcNow.AddHours(-2) // NotBefore must be before Expires
                : DateTime.UtcNow,
            Expires = expired
                ? DateTime.UtcNow.AddHours(-1) // Expired 1 hour ago
                : DateTime.UtcNow.AddHours(2),  // Valid for 2 hours
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

/// <summary>
/// A WebApplicationFactory that uses real JWT validation instead of the test auth handler.
/// This allows testing expired tokens and missing authorization headers.
/// </summary>
public class RealJwtWebApplicationFactory(string secret) : WebApplicationFactory<Program>
{
    private readonly string _secret = secret;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the production DataContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<DataContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Remove any existing DataContext registrations
            var dbContextDescriptors = services
                .Where(d => d.ServiceType == typeof(DataContext)
                         || d.ServiceType == typeof(DbContextOptions<DataContext>)
                         || d.ServiceType == typeof(DbContextOptions))
                .ToList();
            foreach (var d in dbContextDescriptors)
                services.Remove(d);

            // Add in-memory database for testing
            services.AddDbContext<DataContext>(options =>
                options.UseInMemoryDatabase("TestDb_RealJwt_" + Guid.NewGuid()));

            // Remove hosted services that depend on real infrastructure
            var hostedServiceDescriptors = services
                .Where(d => d.ServiceType == typeof(IHostedService))
                .ToList();
            foreach (var d in hostedServiceDescriptors)
                services.Remove(d);

            // Configure AppSettings with our test secret
            services.Configure<AppSettings>(opts =>
            {
                opts.Secret = _secret;
                opts.TokenExpirationHrs = 2;
            });

            // Remove existing authentication registrations and re-add with test secret
            var authDescriptors = services
                .Where(d => d.ServiceType.FullName?.Contains("Authentication") is true
                         || d.ServiceType == typeof(IAuthenticationSchemeProvider)
                         || d.ServiceType == typeof(IAuthenticationHandlerProvider))
                .ToList();
            foreach (var d in authDescriptors)
                services.Remove(d);

            // Re-add JWT authentication with our test secret
            byte[] key = Encoding.ASCII.GetBytes(_secret);
            services.AddAuthentication(d =>
                {
                    d.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    d.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(d =>
                {
                    d.RequireHttpsMetadata = false;
                    d.SaveToken = true;
                    d.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };
                    d.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = context =>
                        {
                            if (context.Exception.GetType() != typeof(SecurityTokenExpiredException))
                                return Task.CompletedTask;

                            context.Response.Headers["Token-Expired"] = "true";
                            return Task.CompletedTask;
                        },
                        OnChallenge = context =>
                        {
                            context.HandleResponse();
                            context.Response.StatusCode = 401;
                            context.Response.ContentType = "application/json";

                            var result = System.Text.Json.JsonSerializer.Serialize(new
                            {
                                success = false,
                                message = "Unauthorized",
                                data = (string?)null
                            });

                            return context.Response.WriteAsync(result);
                        }
                    };
                });
        });

        builder.UseEnvironment("Development");
    }
}
