namespace Hospital.Server.Entities.Response
{
    public class DispenseItemResponse
    {
        public long Id { get; set; }
        public long DispenseId { get; set; }
        public long MedicineId { get; set; }
        public long? PrescriptionItemId { get; set; }
        public string OriginalMedicineName { get; set; } = string.Empty;
        public string DispensedMedicineName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public bool WasSubstituted { get; set; }
        public string? SubstitutionReason { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
