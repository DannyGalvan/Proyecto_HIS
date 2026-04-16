namespace Hospital.Server.Services.Interfaces
{
    /// <summary>
    /// Abstraction for payment gateway integration (CU-04).
    /// Implementations: MockPaymentGateway (dev), StripeGateway, WompiGateway, etc.
    /// </summary>
    public interface IPaymentGateway
    {
        /// <summary>
        /// Process a card payment through the gateway
        /// </summary>
        /// <param name="request">Payment request details</param>
        /// <returns>Gateway response with transaction result</returns>
        Task<PaymentGatewayResponse> ProcessPaymentAsync(PaymentGatewayRequest request);
    }

    /// <summary>
    /// Request model for payment gateway
    /// </summary>
    public class PaymentGatewayRequest
    {
        /// <summary>
        /// Amount in GTQ
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// Card last 4 digits (full card data handled by frontend/tokenized)
        /// </summary>
        public string CardLastFourDigits { get; set; } = string.Empty;

        /// <summary>
        /// Payment token from frontend (tokenized card data - PCI DSS compliant)
        /// </summary>
        public string PaymentToken { get; set; } = string.Empty;

        /// <summary>
        /// Idempotency key to prevent duplicate charges (RNF-016)
        /// </summary>
        public string IdempotencyKey { get; set; } = string.Empty;

        /// <summary>
        /// Description for the transaction
        /// </summary>
        public string Description { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response model from payment gateway
    /// </summary>
    public class PaymentGatewayResponse
    {
        /// <summary>
        /// Whether the payment was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Unique transaction number from the gateway
        /// </summary>
        public string TransactionNumber { get; set; } = string.Empty;

        /// <summary>
        /// Response code from the gateway
        /// </summary>
        public string ResponseCode { get; set; } = string.Empty;

        /// <summary>
        /// Human-readable message (Spanish for user display)
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Rejection reason code: INSUFFICIENT_FUNDS, INVALID_CARD, EXPIRED_CARD, COMMUNICATION_ERROR, OTHER
        /// </summary>
        public string? RejectionReason { get; set; }
    }
}
