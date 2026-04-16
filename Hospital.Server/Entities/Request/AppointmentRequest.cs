using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class AppointmentRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? PatientId { get; set; }
        public long? DoctorId { get; set; }
        public long? SpecialtyId { get; set; }
        public long? BranchId { get; set; }
        public long? AppointmentStatusId { get; set; }
        public DateTime? AppointmentDate { get; set; }
        public string? Reason { get; set; }
        public decimal? Amount { get; set; }
        public int? Priority { get; set; }
        public DateTime? ArrivalTime { get; set; }
        public string? Notes { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
