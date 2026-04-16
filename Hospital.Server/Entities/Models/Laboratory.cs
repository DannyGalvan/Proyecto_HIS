using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class Laboratory : IEntity<long>, ICatalogue
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int State { get; set; }
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
