using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.NotificationLog
{
    public class PartialNotificationLogValidation : PartialUpdateValidator<NotificationLogRequest, long?>
    {
        public PartialNotificationLogValidation()
        {
            When(x => x.RecipientEmail != null, () =>
            {
                RuleFor(x => x.RecipientEmail)
                    .NotEmpty().WithMessage("El correo del destinatario no puede estar vacío")
                    .EmailAddress().WithMessage("El correo del destinatario debe ser una dirección de correo válida")
                    .MaximumLength(255).WithMessage("El correo del destinatario no puede exceder 255 caracteres");
            });

            When(x => x.Subject != null, () =>
            {
                RuleFor(x => x.Subject)
                    .NotEmpty().WithMessage("El asunto no puede estar vacío")
                    .MaximumLength(500).WithMessage("El asunto no puede exceder 500 caracteres");
            });

            When(x => x.NotificationType != null, () =>
            {
                RuleFor(x => x.NotificationType)
                    .InclusiveBetween(0, 4).WithMessage("El tipo de notificación debe ser 0 (Confirmación de Cita), 1 (Notificación de Seguimiento), 2 (Recordatorio de Seguimiento), 3 (Recibo de Pago) o 4 (Resultados de Laboratorio)");
            });

            When(x => x.RelatedEntityType != null, () =>
            {
                RuleFor(x => x.RelatedEntityType)
                    .NotEmpty().WithMessage("El tipo de entidad relacionada no puede estar vacío")
                    .MaximumLength(100).WithMessage("El tipo de entidad relacionada no puede exceder 100 caracteres");
            });

            When(x => x.RelatedEntityId != null, () =>
            {
                RuleFor(x => x.RelatedEntityId)
                    .GreaterThan(0).WithMessage("El ID de la entidad relacionada debe ser mayor a cero");
            });

            When(x => x.Status != null, () =>
            {
                RuleFor(x => x.Status)
                    .InclusiveBetween(0, 3).WithMessage("El estado debe ser 0 (Pendiente), 1 (Enviado), 2 (Error) o 3 (Reintentando)");
            });

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

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
