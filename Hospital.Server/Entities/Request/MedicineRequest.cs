using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class MedicineRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? DefaultPrice { get; set; }
        public string? Unit { get; set; }
        public bool? IsControlled { get; set; }
        public int? MinimumStock { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
