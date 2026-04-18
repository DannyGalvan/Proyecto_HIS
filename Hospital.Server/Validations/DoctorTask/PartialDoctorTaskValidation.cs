using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.DoctorTask
{
    /// <summary>
    /// Defines the <see cref="PartialDoctorTaskValidation" />
    /// </summary>
    public class PartialDoctorTaskValidation : PartialUpdateValidator<DoctorTaskRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialDoctorTaskValidation"/> class.
        /// </summary>
        public PartialDoctorTaskValidation()
        {
            When(x => x.DoctorId != null, () =>
            {
                RuleFor(x => x.DoctorId)
                    .GreaterThan(0).WithMessage("El doctor debe ser mayor a 0");
            });

            When(x => x.Title != null, () =>
            {
                RuleFor(x => x.Title)
                    .MinimumLength(3).WithMessage("El título debe tener al menos 3 caracteres")
                    .MaximumLength(200).WithMessage("El título no puede exceder 200 caracteres");
            });

            When(x => x.Priority != null, () =>
            {
                RuleFor(x => x.Priority)
                    .InclusiveBetween(0, 2).WithMessage("La prioridad debe estar entre 0 (Baja) y 2 (Alta)");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
            });
        }
    }
}
