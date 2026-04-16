using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Dispense
{
    /// <summary>
    /// Defines the <see cref="UpdateDispenseValidation" />
    /// </summary>
    public class UpdateDispenseValidation : UpdateValidator<DispenseRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateDispenseValidation"/> class.
        /// </summary>
        public UpdateDispenseValidation()
        {
            RuleFor(x => x.PrescriptionId)
                .NotNull().WithMessage("La receta asociada es obligatoria")
                .GreaterThan(0).WithMessage("La receta asociada debe ser mayor a 0");

            RuleFor(x => x.PatientId)
                .NotNull().WithMessage("El paciente es obligatorio")
                .GreaterThan(0).WithMessage("El paciente debe ser mayor a 0");

            RuleFor(x => x.PharmacistId)
                .NotNull().WithMessage("El farmacéutico es obligatorio")
                .GreaterThan(0).WithMessage("El farmacéutico debe ser mayor a 0");

            RuleFor(x => x.DispenseStatus)
                .NotNull().WithMessage("El estado del despacho es requerido")
                .InclusiveBetween(0, 4).WithMessage("El estado del despacho debe estar entre 0 y 4");

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
