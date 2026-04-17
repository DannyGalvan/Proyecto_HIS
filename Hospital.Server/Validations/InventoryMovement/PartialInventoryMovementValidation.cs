using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.InventoryMovement
{
    /// <summary>
    /// Defines the <see cref="PartialInventoryMovementValidation" />
    /// </summary>
    public class PartialInventoryMovementValidation : PartialUpdateValidator<InventoryMovementRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialInventoryMovementValidation"/> class.
        /// </summary>
        public PartialInventoryMovementValidation()
        {
            When(x => x.MedicineInventoryId != null, () =>
            {
                RuleFor(x => x.MedicineInventoryId)
                    .GreaterThan(0).WithMessage("El inventario de medicamento debe ser mayor a 0");
            });

            When(x => x.MedicineId != null, () =>
            {
                RuleFor(x => x.MedicineId)
                    .GreaterThan(0).WithMessage("El medicamento debe ser mayor a 0");
            });

            When(x => x.BranchId != null, () =>
            {
                RuleFor(x => x.BranchId)
                    .GreaterThan(0).WithMessage("La sucursal debe ser mayor a 0");
            });

            When(x => x.MovementType != null, () =>
            {
                RuleFor(x => x.MovementType)
                    .InclusiveBetween(0, 6).WithMessage("El tipo de movimiento debe estar entre 0 (Compra) y 6 (Despacho)");
            });

            When(x => x.Quantity != null, () =>
            {
                RuleFor(x => x.Quantity)
                    .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0");
            });

            When(x => x.UnitCost != null, () =>
            {
                RuleFor(x => x.UnitCost)
                    .GreaterThanOrEqualTo(0).WithMessage("El costo unitario no puede ser negativo");
            });

            When(x => x.Notes != null, () =>
            {
                When(x => x.MovementType == 4 || x.MovementType == 5, () =>
                {
                    RuleFor(x => x.Notes)
                        .MinimumLength(10).WithMessage("La justificación debe tener al menos 10 caracteres");
                });
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
            });
        }
    }
}
