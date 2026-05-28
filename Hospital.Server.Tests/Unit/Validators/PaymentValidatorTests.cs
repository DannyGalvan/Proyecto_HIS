using FluentAssertions;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Payment;
using Xunit;

namespace Hospital.Server.Tests.Unit.Validators;

/// <summary>
/// Tests for CreatePaymentValidation entity-specific rules.
/// Validates: Requirements 6.8
/// </summary>
public class PaymentValidatorTests
{
    private readonly CreatePaymentValidation _validator = new();

    private static PaymentRequest CreateValidPaymentRequest() => new()
    {
        Id = null,
        AppointmentId = 1,
        Amount = 150.00m,
        PaymentMethod = 0, // Efectivo
        PaymentType = 1,   // Presencial
        PaymentStatus = 0, // Pendiente
        State = 1,
        CreatedBy = 1
    };

    #region AppointmentId / LabOrderId Association Validation

    [Fact]
    public void CreatePayment_WithNullAppointmentIdAndNullLabOrderId_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.AppointmentId = null;
        request.LabOrderId = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "AppointmentId"
            && e.ErrorMessage == "El pago debe estar asociado a una cita o a una orden de laboratorio.");
    }

    [Fact]
    public void CreatePayment_WithOnlyLabOrderId_ShouldPass()
    {
        var request = CreateValidPaymentRequest();
        request.AppointmentId = null;
        request.LabOrderId = 5;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "AppointmentId");
    }

    [Fact]
    public void CreatePayment_WithZeroAppointmentId_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.AppointmentId = 0;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "AppointmentId"
            && e.ErrorMessage == "El identificador de la cita debe ser válido");
    }

    [Fact]
    public void CreatePayment_WithZeroLabOrderId_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.AppointmentId = null;
        request.LabOrderId = 0;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "LabOrderId"
            && e.ErrorMessage == "El identificador de la orden de laboratorio debe ser válido");
    }

    #endregion

    #region Amount Validation

    [Fact]
    public void CreatePayment_WithNullAmount_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.Amount = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount"
            && e.ErrorMessage == "El monto del pago es obligatorio");
    }

    [Fact]
    public void CreatePayment_WithZeroAmount_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.Amount = 0m;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount"
            && e.ErrorMessage == "El monto del pago debe ser mayor a cero");
    }

    [Fact]
    public void CreatePayment_WithNegativeAmount_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.Amount = -50m;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount"
            && e.ErrorMessage == "El monto del pago debe ser mayor a cero");
    }

    [Fact]
    public void CreatePayment_WithPositiveAmount_ShouldPass()
    {
        var request = CreateValidPaymentRequest();
        request.Amount = 100.50m;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "Amount");
    }

    #endregion

    #region PaymentMethod Validation

    [Fact]
    public void CreatePayment_WithNullPaymentMethod_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentMethod = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PaymentMethod"
            && e.ErrorMessage.Contains("El método de pago es obligatorio"));
    }

    [Fact]
    public void CreatePayment_WithInvalidPaymentMethod_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentMethod = 5;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PaymentMethod"
            && e.ErrorMessage.Contains("El método de pago seleccionado no está disponible"));
    }

    [Theory]
    [InlineData(0)] // Efectivo
    [InlineData(1)] // Tarjeta de crédito
    [InlineData(2)] // Tarjeta de débito
    public void CreatePayment_WithValidPaymentMethod_ShouldPass(int method)
    {
        var request = CreateValidPaymentRequest();
        request.PaymentMethod = method;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "PaymentMethod");
    }

    #endregion

    #region PaymentType Validation

    [Fact]
    public void CreatePayment_WithNullPaymentType_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentType = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PaymentType"
            && e.ErrorMessage == "El tipo de pago es obligatorio");
    }

    [Fact]
    public void CreatePayment_WithInvalidPaymentType_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentType = 3;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PaymentType"
            && e.ErrorMessage == "El tipo de pago debe ser 0 (En línea) o 1 (Presencial)");
    }

    #endregion

    #region PaymentStatus Validation

    [Fact]
    public void CreatePayment_WithNullPaymentStatus_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentStatus = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PaymentStatus"
            && e.ErrorMessage == "El estado del pago es obligatorio");
    }

    [Fact]
    public void CreatePayment_WithInvalidPaymentStatus_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentStatus = 5;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PaymentStatus"
            && e.ErrorMessage == "El estado del pago debe ser 0 (Pendiente), 1 (Completado), 2 (Rechazado) o 3 (Reembolsado)");
    }

    #endregion

    #region CardLastFourDigits Validation

    [Fact]
    public void CreatePayment_WithCardLastFourDigitsWrongLength_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.CardLastFourDigits = "123";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CardLastFourDigits"
            && e.ErrorMessage == "Los últimos 4 dígitos de la tarjeta deben ser exactamente 4 caracteres");
    }

    [Fact]
    public void CreatePayment_WithCardLastFourDigitsNonNumeric_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.CardLastFourDigits = "abcd";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CardLastFourDigits"
            && e.ErrorMessage == "Los últimos 4 dígitos de la tarjeta deben ser numéricos");
    }

    [Fact]
    public void CreatePayment_WithValidCardLastFourDigits_ShouldPass()
    {
        var request = CreateValidPaymentRequest();
        request.CardLastFourDigits = "4567";

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "CardLastFourDigits");
    }

    [Fact]
    public void CreatePayment_WithNullCardLastFourDigits_ShouldPass()
    {
        var request = CreateValidPaymentRequest();
        request.CardLastFourDigits = null;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "CardLastFourDigits");
    }

    #endregion

    #region IdempotencyKey Validation (required for online payments)

    [Fact]
    public void CreatePayment_OnlinePaymentWithNullIdempotencyKey_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentType = 0; // En línea
        request.IdempotencyKey = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "IdempotencyKey"
            && e.ErrorMessage == "La clave de idempotencia es obligatoria para pagos en línea");
    }

    [Fact]
    public void CreatePayment_OnlinePaymentWithEmptyIdempotencyKey_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentType = 0; // En línea
        request.IdempotencyKey = "";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "IdempotencyKey"
            && e.ErrorMessage == "La clave de idempotencia no puede estar vacía");
    }

    [Fact]
    public void CreatePayment_OnlinePaymentWithValidIdempotencyKey_ShouldPass()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentType = 0; // En línea
        request.IdempotencyKey = "unique-key-123";

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "IdempotencyKey");
    }

    [Fact]
    public void CreatePayment_InPersonPaymentWithNullIdempotencyKey_ShouldPass()
    {
        var request = CreateValidPaymentRequest();
        request.PaymentType = 1; // Presencial
        request.IdempotencyKey = null;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "IdempotencyKey");
    }

    #endregion

    #region AmountReceived Validation

    [Fact]
    public void CreatePayment_WithNegativeAmountReceived_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.AmountReceived = -10m;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "AmountReceived"
            && e.ErrorMessage == "El monto recibido no puede ser negativo");
    }

    [Fact]
    public void CreatePayment_WithNullAmountReceived_ShouldPass()
    {
        var request = CreateValidPaymentRequest();
        request.AmountReceived = null;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "AmountReceived");
    }

    #endregion

    #region State Validation

    [Fact]
    public void CreatePayment_WithNullState_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.State = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El estado es obligatorio");
    }

    [Fact]
    public void CreatePayment_WithInvalidState_ShouldFail()
    {
        var request = CreateValidPaymentRequest();
        request.State = 3;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El estado debe ser 0 (Inactivo) o 1 (Activo)");
    }

    #endregion

    #region Full Valid Request

    [Fact]
    public void CreatePayment_WithAllValidFields_ShouldPass()
    {
        var request = CreateValidPaymentRequest();

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    #endregion
}
