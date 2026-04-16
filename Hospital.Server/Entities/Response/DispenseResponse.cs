namespace Hospital.Server.Entities.Response
{
    public class DispenseResponse
    {
        public long Id { get; set; }
        public long PrescriptionId { get; set; }
        public long PatientId { get; set; }
        public long PharmacistId { get; set; }
        public int DispenseStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
