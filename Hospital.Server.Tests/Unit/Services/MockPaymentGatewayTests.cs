using FluentAssertions;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Xunit;

namespace Hospital.Server.Tests.Unit.Services
{
    public class MockPaymentGatewayTests
    {
        private readonly MockPaymentGateway _sut;

        public MockPaymentGatewayTests()
        {
            _sut = new MockPaymentGateway();
        }

        #region Successful Payment

        [Fact]
        public async Task ProcessPaymentAsync_WithValidAmount_ShouldReturnSuccess()
        {
            // Arrange
            var request = new PaymentGatewayRequest
            {
                Amount = 150.00m,
                CardLastFourDigits = "4242",
                PaymentToken = "tok_test_123",
                IdempotencyKey = Guid.NewGuid().ToString(),
                Description = "Pago de cita médica"
            };

            // Act
            var result = await _sut.ProcessPaymentAsync(request);

            // Assert
            result.Success.Should().BeTrue();
            result.ResponseCode.Should().Be("APPROVED");
            result.TransactionNumber.Should().StartWith("TXN-");
            result.TransactionNumber.Should().NotBeNullOrEmpty();
            result.Message.Should().Contain("exitosamente");
            result.RejectionReason.Should().BeNull();
        }

        [Fact]
        public async Task ProcessPaymentAsync_WithValidAmount_ShouldGenerateUniqueTransactionNumbers()
        {
            // Arrange
            var request = new PaymentGatewayRequest
            {
                Amount = 100.00m,
                CardLastFourDigits = "1234",
                PaymentToken = "tok_test_456",
                IdempotencyKey = Guid.NewGuid().ToString(),
                Description = "Test payment"
            };

            // Act
            var result1 = await _sut.ProcessPaymentAsync(request);
            var result2 = await _sut.ProcessPaymentAsync(request);

            // Assert
            result1.TransactionNumber.Should().NotBe(result2.TransactionNumber);
        }

        [Theory]
        [InlineData(0.03)]
        [InlineData(1.00)]
        [InlineData(50.00)]
        [InlineData(999.99)]
        [InlineData(10000.00)]
        public async Task ProcessPaymentAsync_WithVariousValidAmounts_ShouldReturnSuccess(decimal amount)
        {
            // Arrange
            var request = new PaymentGatewayRequest
            {
                Amount = amount,
                CardLastFourDigits = "5555",
                PaymentToken = "tok_valid",
                IdempotencyKey = Guid.NewGuid().ToString(),
                Description = "Test"
            };

            // Act
            var result = await _sut.ProcessPaymentAsync(request);

            // Assert
            result.Success.Should().BeTrue();
            result.ResponseCode.Should().Be("APPROVED");
        }

        #endregion

        #region Insufficient Funds Rejection

        [Fact]
        public async Task ProcessPaymentAsync_WithAmount001_ShouldReturnInsufficientFunds()
        {
            // Arrange
            var request = new PaymentGatewayRequest
            {
                Amount = 0.01m,
                CardLastFourDigits = "4242",
                PaymentToken = "tok_test",
                IdempotencyKey = Guid.NewGuid().ToString(),
                Description = "Test insufficient funds"
            };

            // Act
            var result = await _sut.ProcessPaymentAsync(request);

            // Assert
            result.Success.Should().BeFalse();
            result.ResponseCode.Should().Be("DECLINED");
            result.TransactionNumber.Should().BeEmpty();
            result.RejectionReason.Should().Be("INSUFFICIENT_FUNDS");
            result.Message.Should().Contain("fondos insuficientes");
        }

        #endregion

        #region Invalid Card Rejection

        [Fact]
        public async Task ProcessPaymentAsync_WithAmount002_ShouldReturnInvalidCard()
        {
            // Arrange
            var request = new PaymentGatewayRequest
            {
                Amount = 0.02m,
                CardLastFourDigits = "0000",
                PaymentToken = "tok_invalid",
                IdempotencyKey = Guid.NewGuid().ToString(),
                Description = "Test invalid card"
            };

            // Act
            var result = await _sut.ProcessPaymentAsync(request);

            // Assert
            result.Success.Should().BeFalse();
            result.ResponseCode.Should().Be("INVALID_CARD");
            result.TransactionNumber.Should().BeEmpty();
            result.RejectionReason.Should().Be("INVALID_CARD");
            result.Message.Should().Contain("tarjeta");
        }

        #endregion

        #region Transaction Number Format

        [Fact]
        public async Task ProcessPaymentAsync_SuccessfulPayment_TransactionNumberShouldHaveCorrectFormat()
        {
            // Arrange
            var request = new PaymentGatewayRequest
            {
                Amount = 200.00m,
                CardLastFourDigits = "9999",
                PaymentToken = "tok_format_test",
                IdempotencyKey = Guid.NewGuid().ToString(),
                Description = "Format test"
            };

            // Act
            var result = await _sut.ProcessPaymentAsync(request);

            // Assert
            result.TransactionNumber.Should().StartWith("TXN-");
            result.TransactionNumber.Should().Contain("-");
            // Format: TXN-{yyyyMMddHHmmss}-{8 hex chars}
            result.TransactionNumber.Length.Should().BeGreaterThan(20);
        }

        [Fact]
        public async Task ProcessPaymentAsync_SuccessfulPayment_MessageShouldContainTransactionNumber()
        {
            // Arrange
            var request = new PaymentGatewayRequest
            {
                Amount = 75.50m,
                CardLastFourDigits = "1111",
                PaymentToken = "tok_msg_test",
                IdempotencyKey = Guid.NewGuid().ToString(),
                Description = "Message test"
            };

            // Act
            var result = await _sut.ProcessPaymentAsync(request);

            // Assert
            result.Message.Should().Contain(result.TransactionNumber);
        }

        #endregion
    }
}
