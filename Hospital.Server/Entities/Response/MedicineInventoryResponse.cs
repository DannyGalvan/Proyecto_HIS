namespace Hospital.Server.Entities.Response
{
    public class MedicineInventoryResponse
    {
        public long Id { get; set; }
        public long MedicineId { get; set; }
        public long BranchId { get; set; }
        public int CurrentStock { get; set; }
        public uint RowVersion { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
