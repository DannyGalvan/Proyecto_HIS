using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Payment
{
    public class CreatePaymentValidation : CreateValidator<PaymentRequest, long?>
    {
        public CreatePaymentValidation()
        {
            RuleFor(x => x.AppointmentId)
                .NotNull().WithMessage("La cita asociada es obligatoria")
                .GreaterThan(0).WithMessage("El identificador de la cita debe ser válido");

            RuleFor(x => x.Amount)
                .NotNull().WithMessage("El monto del pago es obligatorio")
                .GreaterThan(0).WithMessage("El monto del pago debe ser mayor a cero");

            RuleFor(x => x.PaymentMethod)
                .NotNull().WithMessage("El método de pago es obligatorio. Los métodos aceptados son: efectivo (0), tarjeta de crédito (1) o tarjeta de débito (2)")
                .InclusiveBetween(0, 2).WithMessage("El método de pago seleccionado no está disponible. Los métodos aceptados son: efectivo (0), tarjeta de crédito (1) o tarjeta de débito (2)");

            RuleFor(x => x.PaymentType)
                .NotNull().WithMessage("El tipo de pago es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El tipo de pago debe ser 0 (En línea) o 1 (Presencial)");

            RuleFor(x => x.PaymentStatus)
                .NotNull().WithMessage("El estado del pago es obligatorio")
                .InclusiveBetween(0, 3).WithMessage("El estado del pago debe ser 0 (Pendiente), 1 (Completado), 2 (Rechazado) o 3 (Reembolsado)");

            When(x => x.CardLastFourDigits != null, () =>
            {
                RuleFor(x => x.CardLastFourDigits)
                    .Length(4).WithMessage("Los últimos 4 dígitos de la tarjeta deben ser exactamente 4 caracteres")
                    .Matches(@"^\d{4}$").WithMessage("Los últimos 4 dígitos de la tarjeta deben ser numéricos");
            });

            When(x => x.PaymentType == 0, () =>
            {
                RuleFor(x => x.IdempotencyKey)
                    .NotNull().WithMessage("La clave de idempotencia es obligatoria para pagos en línea")
                    .NotEmpty().WithMessage("La clave de idempotencia no puede estar vacía");
            });

            When(x => x.AmountReceived != null, () =>
            {
                RuleFor(x => x.AmountReceived)
                    .GreaterThanOrEqualTo(0).WithMessage("El monto recibido no puede ser negativo");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
