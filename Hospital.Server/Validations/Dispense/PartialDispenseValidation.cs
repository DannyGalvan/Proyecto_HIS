using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Dispense
{
    /// <summary>
    /// Defines the <see cref="PartialDispenseValidation" />
    /// </summary>
    public class PartialDispenseValidation : PartialUpdateValidator<DispenseRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialDispenseValidation"/> class.
        /// </summary>
        public PartialDispenseValidation()
        {
            When(x => x.PrescriptionId != null, () =>
            {
                RuleFor(x => x.PrescriptionId)
                    .GreaterThan(0).WithMessage("La receta asociada debe ser mayor a 0");
            });

            When(x => x.PatientId != null, () =>
            {
                RuleFor(x => x.PatientId)
                    .GreaterThan(0).WithMessage("El paciente debe ser mayor a 0");
            });

            When(x => x.PharmacistId != null, () =>
            {
                RuleFor(x => x.PharmacistId)
                    .GreaterThan(0).WithMessage("El farmacéutico debe ser mayor a 0");
            });

            When(x => x.DispenseStatus != null, () =>
            {
                RuleFor(x => x.DispenseStatus)
                    .InclusiveBetween(0, 4).WithMessage("El estado del despacho debe estar entre 0 y 4");
            });

            When(x => x.TotalAmount != null, () =>
            {
                RuleFor(x => x.TotalAmount)
                    .GreaterThanOrEqualTo(0).WithMessage("El monto total debe ser mayor o igual a 0");
            });

            When(x => x.Notes != null, () =>
            {
                RuleFor(x => x.Notes)
                    .MaximumLength(2000).WithMessage("Las notas no pueden exceder 2000 caracteres");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
            });
        }
    }
}
