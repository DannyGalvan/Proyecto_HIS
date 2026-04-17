namespace Hospital.Server.Entities.Request;

public class RecoveryPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    /// <summary>
    /// Base URL of the frontend application (e.g., "https://localhost:5263").
    /// Set by the controller from the HTTP request origin, not sent by the client.
    /// </summary>
    public string BaseUrl { get; set; } = string.Empty;
}
