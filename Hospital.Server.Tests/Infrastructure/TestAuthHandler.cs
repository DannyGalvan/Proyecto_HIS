using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Hospital.Server.Tests.Infrastructure;

/// <summary>
/// Test authentication handler that generates a ClaimsPrincipal with configurable claims.
/// Used by HospitalWebApplicationFactory to simulate authenticated requests
/// without requiring a real JWT token or external identity provider.
/// </summary>
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly TestAuthOptions _testAuthOptions;

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IOptions<TestAuthOptions> testAuthOptions)
        : base(options, logger, encoder)
    {
        _testAuthOptions = testAuthOptions.Value;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Allow tests to simulate unauthenticated requests via query string
        if (Request.Query.ContainsKey("anonymous"))
        {
            return Task.FromResult(AuthenticateResult.Fail("Anonymous request"));
        }

        // Support custom user ID via query string (for multi-user SignalR tests)
        var userId = Request.Query.ContainsKey("userId")
            ? Request.Query["userId"].ToString()
            : "1";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, $"user{userId}@hospital.com"),
            new(ClaimTypes.Name, $"Test User {userId}"),
            new("RoleName", "SA"),
        };

        // Add configurable OperationKey claims for policy-based authorization testing
        foreach (var operationKey in _testAuthOptions.OperationKeys)
        {
            claims.Add(new Claim("OperationKey", operationKey));
        }

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
