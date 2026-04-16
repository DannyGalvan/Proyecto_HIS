using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Medicine
{
    public class PartialMedicineValidation : PartialUpdateValidator<MedicineRequest, long?>
    {
        public PartialMedicineValidation()
        {
            When(x => !string.IsNullOrEmpty(x.Name), () =>
            {
                RuleFor(x => x.Name)
                    .MaximumLength(200).WithMessage("El nombre del medicamento no puede exceder 200 caracteres.");
            });

            When(x => !string.IsNullOrEmpty(x.Description), () =>
            {
                RuleFor(x => x.Description)
                    .MaximumLength(500).WithMessage("La descripción del medicamento no puede exceder 500 caracteres.");
            });

            When(x => x.DefaultPrice != null, () =>
            {
                RuleFor(x => x.DefaultPrice)
                    .GreaterThan(0).WithMessage("El precio por defecto debe ser mayor a cero.");
            });

            When(x => !string.IsNullOrEmpty(x.Unit), () =>
            {
                RuleFor(x => x.Unit)
                    .MaximumLength(50).WithMessage("La unidad de medida no puede exceder 50 caracteres.");
            });

            When(x => x.MinimumStock != null, () =>
            {
                RuleFor(x => x.MinimumStock)
                    .GreaterThanOrEqualTo(0).WithMessage("El stock mínimo no puede ser negativo.");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado del medicamento debe ser 0 (inactivo) o 1 (activo).");
            });
        }
    }
}
