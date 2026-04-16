namespace Hospital.Server.Entities.Response
{
    /// <summary>
    /// Lightweight doctor projection returned by
    /// GET /api/v1/PatientPortal/doctors.
    /// </summary>
    public class DoctorResponse
    {
        /// <summary>
        /// User ID of the doctor.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Full name of the doctor.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Specialty ID associated with the doctor (if available).
        /// </summary>
        public long? SpecialtyId { get; set; }

        /// <summary>
        /// Name of the specialty assigned to the doctor (if any).
        /// </summary>
        public string? SpecialtyName { get; set; }
    }
}
