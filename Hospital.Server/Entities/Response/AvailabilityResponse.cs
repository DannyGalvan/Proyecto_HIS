namespace Hospital.Server.Entities.Response
{
    /// <summary>
    /// Response returned by GET /api/v1/PatientPortal/availability.
    /// Contains the occupied 30-minute slots for a doctor on a given date.
    /// </summary>
    public class AvailabilityResponse
    {
        /// <summary>
        /// ID of the doctor whose availability is being queried.
        /// </summary>
        public long DoctorId { get; set; }

        /// <summary>
        /// The queried date in yyyy-MM-dd format.
        /// </summary>
        public string Date { get; set; } = string.Empty;

        /// <summary>
        /// List of occupied slot start times as ISO 8601 datetime strings
        /// (e.g. "2026-05-01T09:00:00").
        /// The frontend uses these to calculate available slots.
        /// </summary>
        public List<string> OccupiedSlots { get; set; } = new();
    }
}
