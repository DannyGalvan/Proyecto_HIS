namespace Hospital.Server.Entities.Request
{
    /// <summary>
    /// Request DTO for booking an appointment via the patient portal.
    /// Standalone class — does NOT implement IRequest&lt;long&gt;.
    /// </summary>
    public class BookAppointmentRequest
    {
        /// <summary>
        /// ID of the patient making the booking.
        /// </summary>
        public long PatientId { get; set; }

        /// <summary>
        /// ID of the selected doctor.
        /// </summary>
        public long DoctorId { get; set; }

        /// <summary>
        /// ID of the selected specialty.
        /// </summary>
        public long SpecialtyId { get; set; }

        /// <summary>
        /// ID of the selected branch / clinic.
        /// </summary>
        public long BranchId { get; set; }

        /// <summary>
        /// Requested appointment date and time (must be in the future).
        /// </summary>
        public DateTime AppointmentDate { get; set; }

        /// <summary>
        /// Reason for the consultation (10–2000 characters).
        /// </summary>
        public string Reason { get; set; } = string.Empty;

        /// <summary>
        /// Consultation fee amount.
        /// </summary>
        public decimal Amount { get; set; }
    }
}
