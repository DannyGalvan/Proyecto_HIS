using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class PrescriptionRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? ConsultationId { get; set; }
        public long? DoctorId { get; set; }
        public DateTime? PrescriptionDate { get; set; }
        public string? Notes { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
