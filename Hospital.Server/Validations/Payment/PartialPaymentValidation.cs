using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Payment
{
    public class PartialPaymentValidation : PartialUpdateValidator<PaymentRequest, long?>
    {
        public PartialPaymentValidation()
        {
            When(x => x.AppointmentId != null, () =>
            {
                RuleFor(x => x.AppointmentId)
                    .GreaterThan(0).WithMessage("El identificador de la cita debe ser válido");
            });

            When(x => x.Amount != null, () =>
            {
                RuleFor(x => x.Amount)
                    .GreaterThan(0).WithMessage("El monto del pago debe ser mayor a cero");
            });

            When(x => x.PaymentMethod != null, () =>
            {
                RuleFor(x => x.PaymentMethod)
                    .InclusiveBetween(0, 2).WithMessage("El método de pago seleccionado no está disponible. Los métodos aceptados son: efectivo (0), tarjeta de crédito (1) o tarjeta de débito (2)");
            });

            When(x => x.PaymentType != null, () =>
            {
                RuleFor(x => x.PaymentType)
                    .InclusiveBetween(0, 1).WithMessage("El tipo de pago debe ser 0 (En línea) o 1 (Presencial)");
            });

            When(x => x.PaymentStatus != null, () =>
            {
                RuleFor(x => x.PaymentStatus)
                    .InclusiveBetween(0, 3).WithMessage("El estado del pago debe ser 0 (Pendiente), 1 (Completado), 2 (Rechazado) o 3 (Reembolsado)");
            });

            When(x => x.CardLastFourDigits != null, () =>
            {
                RuleFor(x => x.CardLastFourDigits)
                    .Length(4).WithMessage("Los últimos 4 dígitos de la tarjeta deben ser exactamente 4 caracteres")
                    .Matches(@"^\d{4}$").WithMessage("Los últimos 4 dígitos de la tarjeta deben ser numéricos");
            });

            When(x => x.AmountReceived != null, () =>
            {
                RuleFor(x => x.AmountReceived)
                    .GreaterThanOrEqualTo(0).WithMessage("El monto recibido no puede ser negativo");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
