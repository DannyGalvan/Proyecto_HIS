using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.AppointmentDocument
{
    public class PartialAppointmentDocumentValidation : PartialUpdateValidator<AppointmentDocumentRequest, long?>
    {
        public PartialAppointmentDocumentValidation()
        {
            When(x => x.AppointmentId != null, () =>
            {
                RuleFor(x => x.AppointmentId)
                    .GreaterThan(0).WithMessage("El identificador de la cita debe ser válido");
            });

            When(x => !string.IsNullOrEmpty(x.FileName), () =>
            {
                RuleFor(x => x.FileName)
                    .MaximumLength(255).WithMessage("El nombre del archivo no debe exceder los 255 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.ContentType), () =>
            {
                RuleFor(x => x.ContentType)
                    .Must(ct => ct == "application/pdf").WithMessage("El documento debe ser un archivo PDF válido");
            });

            When(x => x.FileSize != null, () =>
            {
                RuleFor(x => x.FileSize)
                    .GreaterThan(0).WithMessage("El archivo no puede estar vacío")
                    .LessThanOrEqualTo(2 * 1024 * 1024).WithMessage("El documento debe tener un tamaño máximo de 2 MB");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
