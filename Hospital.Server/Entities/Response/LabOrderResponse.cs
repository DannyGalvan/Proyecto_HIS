namespace Hospital.Server.Entities.Response
{
    public class LabOrderResponse
    {
        public long Id { get; set; }
        public long ConsultationId { get; set; }
        public long DoctorId { get; set; }
        public long PatientId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int OrderStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsExternal { get; set; }
        public string? Notes { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
