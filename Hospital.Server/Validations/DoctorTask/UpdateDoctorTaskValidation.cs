using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.DoctorTask
{
    /// <summary>
    /// Defines the <see cref="UpdateDoctorTaskValidation" />
    /// </summary>
    public class UpdateDoctorTaskValidation : UpdateValidator<DoctorTaskRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateDoctorTaskValidation"/> class.
        /// </summary>
        public UpdateDoctorTaskValidation()
        {
            RuleFor(x => x.DoctorId)
                .NotNull().WithMessage("El doctor es requerido")
                .GreaterThan(0).WithMessage("El doctor debe ser mayor a 0");

            RuleFor(x => x.Title)
                .NotNull().WithMessage("El título es requerido")
                .NotEmpty().WithMessage("El título es requerido")
                .MinimumLength(3).WithMessage("El título debe tener al menos 3 caracteres")
                .MaximumLength(200).WithMessage("El título no puede exceder 200 caracteres");

            RuleFor(x => x.DueDate)
                .NotNull().WithMessage("La fecha de vencimiento es requerida");

            RuleFor(x => x.Priority)
                .NotNull().WithMessage("La prioridad es requerida")
                .InclusiveBetween(0, 2).WithMessage("La prioridad debe estar entre 0 (Baja) y 2 (Alta)");
        }
    }
}
