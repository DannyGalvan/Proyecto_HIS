using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.DispenseItem
{
    /// <summary>
    /// Defines the <see cref="PartialDispenseItemValidation" />
    /// </summary>
    public class PartialDispenseItemValidation : PartialUpdateValidator<DispenseItemRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialDispenseItemValidation"/> class.
        /// </summary>
        public PartialDispenseItemValidation()
        {
            When(x => x.DispenseId != null, () =>
            {
                RuleFor(x => x.DispenseId)
                    .GreaterThan(0).WithMessage("El despacho asociado debe ser mayor a 0");
            });

            When(x => x.MedicineId != null, () =>
            {
                RuleFor(x => x.MedicineId)
                    .GreaterThan(0).WithMessage("El medicamento debe ser mayor a 0");
            });

            When(x => x.PrescriptionItemId != null, () =>
            {
                RuleFor(x => x.PrescriptionItemId)
                    .GreaterThan(0).WithMessage("El medicamento prescrito debe ser mayor a 0");
            });

            When(x => x.OriginalMedicineName != null, () =>
            {
                RuleFor(x => x.OriginalMedicineName)
                    .NotEmpty().WithMessage("El nombre original del medicamento no puede estar vacío")
                    .MaximumLength(200).WithMessage("El nombre original del medicamento no puede exceder 200 caracteres");
            });

            When(x => x.DispensedMedicineName != null, () =>
            {
                RuleFor(x => x.DispensedMedicineName)
                    .NotEmpty().WithMessage("El nombre del medicamento despachado no puede estar vacío")
                    .MaximumLength(200).WithMessage("El nombre del medicamento despachado no puede exceder 200 caracteres");
            });

            When(x => x.Quantity != null, () =>
            {
                RuleFor(x => x.Quantity)
                    .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0");
            });

            When(x => x.UnitPrice != null, () =>
            {
                RuleFor(x => x.UnitPrice)
                    .GreaterThanOrEqualTo(0).WithMessage("El precio unitario debe ser mayor o igual a 0");
            });

            When(x => x.SubstitutionReason != null, () =>
            {
                RuleFor(x => x.SubstitutionReason)
                    .MaximumLength(500).WithMessage("La razón de substitución no puede exceder 500 caracteres");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
            });
        }
    }
}
