using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Dispense
{
    /// <summary>
    /// Defines the <see cref="CreateDispenseValidation" />
    /// </summary>
    public class CreateDispenseValidation : CreateValidator<DispenseRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateDispenseValidation"/> class.
        /// </summary>
        public CreateDispenseValidation()
        {
            RuleFor(x => x.PrescriptionId)
                .NotNull().WithMessage("La receta asociada es obligatoria")
                .GreaterThan(0).WithMessage("La receta asociada debe ser mayor a 0");

            // PatientId is optional — resolved server-side from Prescription → Consultation → Appointment chain
            When(x => x.PatientId.HasValue, () =>
            {
                RuleFor(x => x.PatientId)
                    .GreaterThan(0).WithMessage("El paciente debe ser mayor a 0");
            });

            // PharmacistId is optional — resolved server-side from JWT claims
            When(x => x.PharmacistId.HasValue, () =>
            {
                RuleFor(x => x.PharmacistId)
                    .GreaterThan(0).WithMessage("El farmacéutico debe ser mayor a 0");
            });

            // DispenseStatus is optional — defaults to 1 (dispensed) when not provided
            When(x => x.DispenseStatus.HasValue, () =>
            {
                RuleFor(x => x.DispenseStatus)
                    .InclusiveBetween(0, 4).WithMessage("El estado del despacho debe estar entre 0 y 4");
            });

            RuleFor(x => x.TotalAmount)
                .NotNull().WithMessage("El monto total es obligatorio")
                .GreaterThanOrEqualTo(0).WithMessage("El monto total debe ser mayor o igual a 0");

            When(x => x.Notes != null, () =>
            {
                RuleFor(x => x.Notes)
                    .MaximumLength(2000).WithMessage("Las notas no pueden exceder 2000 caracteres");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es requerido")
                .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
        }
    }
}
