namespace Hospital.Server.Entities.Response
{
    public class DoctorEventResponse
    {
        public long Id { get; set; }
        public long DoctorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public int EventType { get; set; }
        public bool IsAllDay { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
        public string? DoctorName { get; set; }
    }
}
