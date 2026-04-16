using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class PaymentRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? AppointmentId { get; set; }
        public long? LabOrderId { get; set; }
        public long? DispenseId { get; set; }
        public string? TransactionNumber { get; set; }
        public decimal? Amount { get; set; }
        public int? PaymentMethod { get; set; }
        public int? PaymentType { get; set; }
        public int? PaymentStatus { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? CardLastFourDigits { get; set; }
        public string? IdempotencyKey { get; set; }
        public decimal? AmountReceived { get; set; }
        public decimal? ChangeAmount { get; set; }
        public string? GatewayResponseCode { get; set; }
        public string? GatewayMessage { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
