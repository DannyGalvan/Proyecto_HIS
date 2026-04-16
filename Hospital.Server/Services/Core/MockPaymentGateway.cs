using Hospital.Server.Services.Interfaces;

namespace Hospital.Server.Services.Core
{
    /// <summary>
    /// Mock implementation of IPaymentGateway for development and testing.
    /// Simulates successful payment processing. Replace with real gateway
    /// (Stripe, Wompi, etc.) for production.
    /// </summary>
    public class MockPaymentGateway : IPaymentGateway
    {
        /// <summary>
        /// Simulates payment processing. Always returns success unless
        /// the amount is exactly 0.01 (used for testing rejection scenarios).
        /// </summary>
        public async Task<PaymentGatewayResponse> ProcessPaymentAsync(PaymentGatewayRequest request)
        {
            // Simulate network latency
            await Task.Delay(500);

            // Simulate rejection for testing: amount 0.01 = insufficient funds
            if (request.Amount == 0.01m)
            {
                return new PaymentGatewayResponse
                {
                    Success = false,
                    TransactionNumber = string.Empty,
                    ResponseCode = "DECLINED",
                    Message = "El pago fue rechazado por fondos insuficientes. Por favor, verifique su saldo o utilice otra tarjeta.",
                    RejectionReason = "INSUFFICIENT_FUNDS"
                };
            }

            // Simulate rejection for testing: amount 0.02 = invalid card
            if (request.Amount == 0.02m)
            {
                return new PaymentGatewayResponse
                {
                    Success = false,
                    TransactionNumber = string.Empty,
                    ResponseCode = "INVALID_CARD",
                    Message = "El número de tarjeta ingresado no es válido. Por favor, verifique los datos e intente nuevamente.",
                    RejectionReason = "INVALID_CARD"
                };
            }

            // Generate unique transaction number
            var transactionNumber = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

            return new PaymentGatewayResponse
            {
                Success = true,
                TransactionNumber = transactionNumber,
                ResponseCode = "APPROVED",
                Message = $"¡Pago realizado exitosamente! Número de transacción: {transactionNumber}.",
                RejectionReason = null
            };
        }
    }
}
