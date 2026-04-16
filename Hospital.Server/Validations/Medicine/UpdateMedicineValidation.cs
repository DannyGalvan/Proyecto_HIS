using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Medicine
{
    public class UpdateMedicineValidation : UpdateValidator<MedicineRequest, long?>
    {
        public UpdateMedicineValidation()
        {
            RuleFor(x => x.Name)
                .NotNull().WithMessage("El nombre del medicamento es requerido.")
                .NotEmpty().WithMessage("El nombre del medicamento no puede estar vacío.")
                .MaximumLength(200).WithMessage("El nombre del medicamento no puede exceder 200 caracteres.");

            RuleFor(x => x.Description)
                .NotNull().WithMessage("La descripción del medicamento es requerida.")
                .NotEmpty().WithMessage("La descripción del medicamento no puede estar vacía.")
                .MaximumLength(500).WithMessage("La descripción del medicamento no puede exceder 500 caracteres.");

            RuleFor(x => x.DefaultPrice)
                .NotNull().WithMessage("El precio por defecto es requerido.")
                .GreaterThan(0).WithMessage("El precio por defecto debe ser mayor a cero.");

            RuleFor(x => x.Unit)
                .NotNull().WithMessage("La unidad de medida es requerida.")
                .NotEmpty().WithMessage("La unidad de medida no puede estar vacía.")
                .MaximumLength(50).WithMessage("La unidad de medida no puede exceder 50 caracteres.");

            When(x => x.MinimumStock != null, () =>
            {
                RuleFor(x => x.MinimumStock)
                    .GreaterThanOrEqualTo(0).WithMessage("El stock mínimo no puede ser negativo.");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado del medicamento es requerido.")
                .InclusiveBetween(0, 1).WithMessage("El estado del medicamento debe ser 0 (inactivo) o 1 (activo).");
        }
    }
}
