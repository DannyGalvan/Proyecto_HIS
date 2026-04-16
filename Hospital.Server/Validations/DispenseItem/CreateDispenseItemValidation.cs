using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.DispenseItem
{
    /// <summary>
    /// Defines the <see cref="CreateDispenseItemValidation" />
    /// </summary>
    public class CreateDispenseItemValidation : CreateValidator<DispenseItemRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateDispenseItemValidation"/> class.
        /// </summary>
        public CreateDispenseItemValidation()
        {
            RuleFor(x => x.DispenseId)
                .NotNull().WithMessage("El despacho asociado es obligatorio")
                .GreaterThan(0).WithMessage("El despacho asociado debe ser mayor a 0");

            RuleFor(x => x.MedicineId)
                .NotNull().WithMessage("El medicamento es obligatorio")
                .GreaterThan(0).WithMessage("El medicamento debe ser mayor a 0");

            When(x => x.PrescriptionItemId != null, () =>
            {
                RuleFor(x => x.PrescriptionItemId)
                    .GreaterThan(0).WithMessage("El medicamento prescrito debe ser mayor a 0");
            });

            RuleFor(x => x.OriginalMedicineName)
                .NotNull().WithMessage("El nombre original del medicamento es obligatorio")
                .NotEmpty().WithMessage("El nombre original del medicamento no puede estar vacío")
                .MaximumLength(200).WithMessage("El nombre original del medicamento no puede exceder 200 caracteres");

            RuleFor(x => x.DispensedMedicineName)
                .NotNull().WithMessage("El nombre del medicamento despachado es obligatorio")
                .NotEmpty().WithMessage("El nombre del medicamento despachado no puede estar vacío")
                .MaximumLength(200).WithMessage("El nombre del medicamento despachado no puede exceder 200 caracteres");

            RuleFor(x => x.Quantity)
                .NotNull().WithMessage("La cantidad es obligatoria")
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0");

            RuleFor(x => x.UnitPrice)
                .NotNull().WithMessage("El precio unitario es obligatorio")
                .GreaterThanOrEqualTo(0).WithMessage("El precio unitario debe ser mayor o igual a 0");

            When(x => x.SubstitutionReason != null, () =>
            {
                RuleFor(x => x.SubstitutionReason)
                    .MaximumLength(500).WithMessage("La razón de substitución no puede exceder 500 caracteres");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es requerido")
                .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
        }
    }
}
