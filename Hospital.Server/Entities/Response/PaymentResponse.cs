namespace Hospital.Server.Entities.Response
{
    public class PaymentResponse
    {
        public long Id { get; set; }
        public long? AppointmentId { get; set; }
        public long? LabOrderId { get; set; }
        public string TransactionNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int PaymentMethod { get; set; }
        public int PaymentType { get; set; }
        public int PaymentStatus { get; set; }
        public string PaymentDate { get; set; } = string.Empty;
        public string? CardLastFourDigits { get; set; }
        public string? IdempotencyKey { get; set; }
        public decimal? AmountReceived { get; set; }
        public decimal? ChangeAmount { get; set; }
        public string? GatewayResponseCode { get; set; }
        public string? GatewayMessage { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
