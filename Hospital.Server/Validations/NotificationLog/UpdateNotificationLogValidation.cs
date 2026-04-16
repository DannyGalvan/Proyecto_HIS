using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.NotificationLog
{
    public class UpdateNotificationLogValidation : UpdateValidator<NotificationLogRequest, long?>
    {
        public UpdateNotificationLogValidation()
        {
            RuleFor(x => x.RecipientEmail)
                .NotNull().WithMessage("El correo del destinatario es obligatorio")
                .NotEmpty().WithMessage("El correo del destinatario no puede estar vacío")
                .EmailAddress().WithMessage("El correo del destinatario debe ser una dirección de correo válida")
                .MaximumLength(255).WithMessage("El correo del destinatario no puede exceder 255 caracteres");

            RuleFor(x => x.Subject)
                .NotNull().WithMessage("El asunto es obligatorio")
                .NotEmpty().WithMessage("El asunto no puede estar vacío")
                .MaximumLength(500).WithMessage("El asunto no puede exceder 500 caracteres");

            RuleFor(x => x.NotificationType)
                .NotNull().WithMessage("El tipo de notificación es obligatorio")
                .InclusiveBetween(0, 4).WithMessage("El tipo de notificación debe ser 0 (Confirmación de Cita), 1 (Notificación de Seguimiento), 2 (Recordatorio de Seguimiento), 3 (Recibo de Pago) o 4 (Resultados de Laboratorio)");

            RuleFor(x => x.RelatedEntityType)
                .NotNull().WithMessage("El tipo de entidad relacionada es obligatorio")
                .NotEmpty().WithMessage("El tipo de entidad relacionada no puede estar vacío")
                .MaximumLength(100).WithMessage("El tipo de entidad relacionada no puede exceder 100 caracteres");

            RuleFor(x => x.RelatedEntityId)
                .NotNull().WithMessage("El ID de la entidad relacionada es obligatorio")
                .GreaterThan(0).WithMessage("El ID de la entidad relacionada debe ser mayor a cero");

            RuleFor(x => x.Status)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 3).WithMessage("El estado debe ser 0 (Pendiente), 1 (Enviado), 2 (Error) o 3 (Reintentando)");

            When(x => x.RetryCount != null, () =>
            {
                RuleFor(x => x.RetryCount)
                    .GreaterThanOrEqualTo(0).WithMessage("El contador de reintentos no puede ser negativo");
            });

            When(x => x.ErrorMessage != null, () =>
            {
                RuleFor(x => x.ErrorMessage)
                    .MaximumLength(2000).WithMessage("El mensaje de error no puede exceder 2000 caracteres");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
