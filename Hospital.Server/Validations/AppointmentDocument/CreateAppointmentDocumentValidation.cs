using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.AppointmentDocument
{
    public class CreateAppointmentDocumentValidation : CreateValidator<AppointmentDocumentRequest, long?>
    {
        public CreateAppointmentDocumentValidation()
        {
            RuleFor(x => x.AppointmentId)
                .NotNull().WithMessage("La cita asociada es obligatoria")
                .GreaterThan(0).WithMessage("El identificador de la cita debe ser válido");

            RuleFor(x => x.FileName)
                .NotNull().WithMessage("El nombre del archivo es obligatorio")
                .NotEmpty().WithMessage("El nombre del archivo no puede estar vacío")
                .MaximumLength(255).WithMessage("El nombre del archivo no debe exceder los 255 caracteres");

            RuleFor(x => x.FilePath)
                .NotNull().WithMessage("La ruta del archivo es obligatoria")
                .NotEmpty().WithMessage("La ruta del archivo no puede estar vacía");

            RuleFor(x => x.ContentType)
                .NotNull().WithMessage("El tipo de contenido es obligatorio")
                .Must(ct => ct == "application/pdf").WithMessage("El documento debe ser un archivo PDF válido, no encriptado y con tamaño máximo de 2 MB");

            RuleFor(x => x.FileSize)
                .NotNull().WithMessage("El tamaño del archivo es obligatorio")
                .GreaterThan(0).WithMessage("El archivo no puede estar vacío")
                .LessThanOrEqualTo(2 * 1024 * 1024).WithMessage("El documento debe tener un tamaño máximo de 2 MB");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
