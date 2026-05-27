namespace Hospital.Server.Tests.Infrastructure;

/// <summary>
/// Options for configuring test authentication claims.
/// Allows individual tests to specify which OperationKey claims
/// the test user should have for policy-based authorization scenarios.
/// </summary>
public class TestAuthOptions
{
    /// <summary>
    /// Gets or sets the list of OperationKey claims to include in the test user's ClaimsPrincipal.
    /// Each key follows the format "Controller.Action.HttpMethod" (e.g., "User.GetAll.GET").
    /// </summary>
    public List<string> OperationKeys { get; set; } = new();
}
