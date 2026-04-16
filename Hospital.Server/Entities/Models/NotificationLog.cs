using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class NotificationLog : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// Email address of the notification recipient
        /// </summary>
        public string RecipientEmail { get; set; } = string.Empty;

        /// <summary>
        /// Subject of the notification email
        /// </summary>
        public string Subject { get; set; } = string.Empty;

        /// <summary>
        /// Type of notification: 0=AppointmentConfirmation, 1=FollowUpNotification, 2=FollowUpReminder, 3=PaymentReceipt, 4=LabResults
        /// </summary>
        public int NotificationType { get; set; }

        /// <summary>
        /// Type of the related entity (e.g. "Appointment", "LabOrder")
        /// </summary>
        public string RelatedEntityType { get; set; } = string.Empty;

        /// <summary>
        /// ID of the related entity
        /// </summary>
        public long RelatedEntityId { get; set; }

        /// <summary>
        /// Date and time when the notification was sent
        /// </summary>
        public DateTime? SentAt { get; set; }

        /// <summary>
        /// Status of the notification: 0=Pending, 1=Sent, 2=Failed, 3=Retrying
        /// </summary>
        public int Status { get; set; } = 0;

        /// <summary>
        /// Number of retry attempts
        /// </summary>
        public int RetryCount { get; set; } = 0;

        /// <summary>
        /// Error message if the notification failed
        /// </summary>
        public string? ErrorMessage { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
