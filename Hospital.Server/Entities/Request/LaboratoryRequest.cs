using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class LaboratoryRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
