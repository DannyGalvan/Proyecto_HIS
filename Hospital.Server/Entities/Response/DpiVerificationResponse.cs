namespace Hospital.Server.Entities.Response
{
    /// <summary>
    /// Response returned by GET /api/v1/PatientPortal/verify-dpi/{dpi}.
    /// </summary>
    public class DpiVerificationResponse
    {
        /// <summary>
        /// Whether an active user with the given DPI exists in the system.
        /// </summary>
        public bool Exists { get; set; }

        /// <summary>
        /// Whether the found user has the "Paciente" role.
        /// Always false when <see cref="Exists"/> is false.
        /// </summary>
        public bool HasPatientRole { get; set; }

        /// <summary>
        /// Full name of the patient if found; null otherwise.
        /// </summary>
        public string? Name { get; set; }
    }
}
