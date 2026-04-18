using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class DoctorTaskRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? DoctorId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? IsCompleted { get; set; }
        public int? Priority { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
