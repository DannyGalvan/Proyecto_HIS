using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.DoctorEvent
{
    /// <summary>
    /// Defines the <see cref="UpdateDoctorEventValidation" />
    /// </summary>
    public class UpdateDoctorEventValidation : UpdateValidator<DoctorEventRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateDoctorEventValidation"/> class.
        /// </summary>
        public UpdateDoctorEventValidation()
        {
            RuleFor(x => x.DoctorId)
                .NotNull().WithMessage("El doctor es requerido")
                .GreaterThan(0).WithMessage("El doctor debe ser mayor a 0");

            RuleFor(x => x.Title)
                .NotNull().WithMessage("El título es requerido")
                .NotEmpty().WithMessage("El título es requerido")
                .MinimumLength(3).WithMessage("El título debe tener al menos 3 caracteres")
                .MaximumLength(200).WithMessage("El título no puede exceder 200 caracteres");

            RuleFor(x => x.StartDate)
                .NotNull().WithMessage("La fecha de inicio es requerida");

            RuleFor(x => x.EndDate)
                .NotNull().WithMessage("La fecha de fin es requerida");

            RuleFor(x => x.EventType)
                .NotNull().WithMessage("El tipo de evento es requerido")
                .InclusiveBetween(0, 4).WithMessage("El tipo de evento debe estar entre 0 (Reunión) y 4 (Otro)");
        }
    }
}
