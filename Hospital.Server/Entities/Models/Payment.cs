using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class Payment : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to Appointment (for consultation payments)
        /// </summary>
        public long? AppointmentId { get; set; }

        /// <summary>
        /// FK to LabOrder (for laboratory payments - CU-09)
        /// </summary>
        public long? LabOrderId { get; set; }

        /// <summary>
        /// Unique transaction number (auto-generated)
        /// </summary>
        public string TransactionNumber { get; set; } = string.Empty;

        /// <summary>
        /// Payment amount in GTQ
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// 0 = Cash, 1 = CreditCard, 2 = DebitCard (RN-GLOBAL-004)
        /// </summary>
        public int PaymentMethod { get; set; }

        /// <summary>
        /// 0 = Online, 1 = InPerson (CU-04 vs CU-06)
        /// </summary>
        public int PaymentType { get; set; }

        /// <summary>
        /// 0 = Pending, 1 = Completed, 2 = Rejected, 3 = Refunded
        /// </summary>
        public int PaymentStatus { get; set; }

        /// <summary>
        /// Date and time when payment was processed
        /// </summary>
        public DateTime PaymentDate { get; set; }

        /// <summary>
        /// Last 4 digits of card (masked per RNF-012), null for cash
        /// </summary>
        public string? CardLastFourDigits { get; set; }

        /// <summary>
        /// Idempotency key to prevent duplicate charges (RNF-016)
        /// </summary>
        public string? IdempotencyKey { get; set; }

        /// <summary>
        /// Amount received (for cash payments - change calculation)
        /// </summary>
        public decimal? AmountReceived { get; set; }

        /// <summary>
        /// Change to return (for cash payments)
        /// </summary>
        public decimal? ChangeAmount { get; set; }

        /// <summary>
        /// Gateway response code or POS response
        /// </summary>
        public string? GatewayResponseCode { get; set; }

        /// <summary>
        /// Gateway rejection reason message
        /// </summary>
        public string? GatewayMessage { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Appointment? Appointment { get; set; }
        public virtual LabOrder? LabOrder { get; set; }
    }
}
