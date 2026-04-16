using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class LabOrderRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? ConsultationId { get; set; }
        public long? DoctorId { get; set; }
        public long? PatientId { get; set; }
        public string? OrderNumber { get; set; }
        public int? OrderStatus { get; set; }
        public decimal? TotalAmount { get; set; }
        public bool? IsExternal { get; set; }
        public string? Notes { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
