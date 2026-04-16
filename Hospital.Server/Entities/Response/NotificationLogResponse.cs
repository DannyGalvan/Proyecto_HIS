namespace Hospital.Server.Entities.Response
{
    public class NotificationLogResponse
    {
        public long Id { get; set; }
        public string RecipientEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public int NotificationType { get; set; }
        public string RelatedEntityType { get; set; } = string.Empty;
        public long RelatedEntityId { get; set; }
        public string? SentAt { get; set; }
        public int Status { get; set; }
        public int RetryCount { get; set; }
        public string? ErrorMessage { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
