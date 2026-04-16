using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.AppointmentStatus
{
    public class UpdateAppointmentStatusValidation : UpdateValidator<AppointmentStatusRequest, long?>
    {
        public UpdateAppointmentStatusValidation()
        {
            RuleFor(x => x.Name)
                .NotNull().WithMessage("El nombre es obligatorio")
                .NotEmpty().WithMessage("El nombre no puede estar vacío")
                .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres");

            RuleFor(x => x.Description)
                .NotNull().WithMessage("La descripción es obligatoria")
                .NotEmpty().WithMessage("La descripción no puede estar vacía")
                .MaximumLength(250).WithMessage("La descripción no debe exceder los 250 caracteres");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
