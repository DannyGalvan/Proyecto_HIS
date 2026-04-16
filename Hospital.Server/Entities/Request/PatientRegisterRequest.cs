namespace Hospital.Server.Entities.Request
{
    /// <summary>
    /// Request DTO for patient self-registration via the public portal.
    /// This is NOT an IRequest&lt;long&gt; DTO — it is a standalone class used
    /// exclusively by the PatientPortalController public endpoint.
    /// </summary>
    public class PatientRegisterRequest
    {
        /// <summary>
        /// Full name of the patient (10–100 characters).
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Guatemalan DPI — exactly 13 numeric digits.
        /// </summary>
        public string Dpi { get; set; } = string.Empty;

        /// <summary>
        /// Desired username (8–9 characters).
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Password — minimum 12 characters.
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Valid e-mail address (RFC 5322).
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Phone number — exactly 8 numeric digits.
        /// </summary>
        public string Number { get; set; } = string.Empty;

        /// <summary>
        /// Optional NIT — 8–9 alphanumeric characters.
        /// </summary>
        public string? Nit { get; set; }

        /// <summary>
        /// Optional insurance / policy number — 5–50 characters.
        /// </summary>
        public string? InsuranceNumber { get; set; }
    }
}
