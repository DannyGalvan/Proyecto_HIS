using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.DoctorEvent
{
    /// <summary>
    /// Defines the <see cref="PartialDoctorEventValidation" />
    /// </summary>
    public class PartialDoctorEventValidation : PartialUpdateValidator<DoctorEventRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialDoctorEventValidation"/> class.
        /// </summary>
        public PartialDoctorEventValidation()
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

            When(x => x.EventType != null, () =>
            {
                RuleFor(x => x.EventType)
                    .InclusiveBetween(0, 4).WithMessage("El tipo de evento debe estar entre 0 (Reunión) y 4 (Otro)");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
            });
        }
    }
}
