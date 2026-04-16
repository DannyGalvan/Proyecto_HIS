using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class PrescriptionItemRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? PrescriptionId { get; set; }
        public string? MedicineName { get; set; }
        public string? Dosage { get; set; }
        public string? Frequency { get; set; }
        public string? Duration { get; set; }
        public string? SpecialInstructions { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
