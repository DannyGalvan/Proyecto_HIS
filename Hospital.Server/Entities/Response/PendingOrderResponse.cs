namespace Hospital.Server.Entities.Response
{
    public class PendingOrderResponse
    {
        public string OrderType { get; set; } = string.Empty;
        public long OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string PatientDpi { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
        public int PaymentType { get; set; }
    }
}
