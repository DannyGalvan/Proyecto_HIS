using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class DoctorEventRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? DoctorId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? EventType { get; set; }
        public bool? IsAllDay { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
