using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class MedicineInventoryRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? MedicineId { get; set; }
        public long? BranchId { get; set; }
        public int? CurrentStock { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
