using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class AppointmentDocumentRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? AppointmentId { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? ContentType { get; set; }
        public long? FileSize { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
