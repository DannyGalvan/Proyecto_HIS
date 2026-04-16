using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class NotificationLogRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public string? RecipientEmail { get; set; }
        public string? Subject { get; set; }
        public int? NotificationType { get; set; }
        public string? RelatedEntityType { get; set; }
        public long? RelatedEntityId { get; set; }
        public DateTime? SentAt { get; set; }
        public int? Status { get; set; }
        public int? RetryCount { get; set; }
        public string? ErrorMessage { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
