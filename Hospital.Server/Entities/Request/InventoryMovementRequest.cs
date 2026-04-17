using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class InventoryMovementRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? MedicineInventoryId { get; set; }
        public long? MedicineId { get; set; }
        public long? BranchId { get; set; }
        public int? MovementType { get; set; }
        public int? Quantity { get; set; }
        public int? PreviousStock { get; set; }
        public int? NewStock { get; set; }
        public decimal? UnitCost { get; set; }
        public decimal? TotalCost { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? ReferenceType { get; set; }
        public string? Notes { get; set; }
        public long? UserId { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
