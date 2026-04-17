using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.InventoryMovement
{
    /// <summary>
    /// Defines the <see cref="CreateInventoryMovementValidation" />
    /// </summary>
    public class CreateInventoryMovementValidation : CreateValidator<InventoryMovementRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateInventoryMovementValidation"/> class.
        /// </summary>
        public CreateInventoryMovementValidation()
        {
            RuleFor(x => x.MedicineInventoryId)
                .NotNull().WithMessage("El inventario de medicamento es requerido")
                .GreaterThan(0).WithMessage("El inventario de medicamento debe ser mayor a 0");

            RuleFor(x => x.MedicineId)
                .NotNull().WithMessage("El medicamento es requerido")
                .GreaterThan(0).WithMessage("El medicamento debe ser mayor a 0");

            RuleFor(x => x.BranchId)
                .NotNull().WithMessage("La sucursal es requerida")
                .GreaterThan(0).WithMessage("La sucursal debe ser mayor a 0");

            RuleFor(x => x.MovementType)
                .NotNull().WithMessage("El tipo de movimiento es requerido")
                .InclusiveBetween(0, 6).WithMessage("El tipo de movimiento debe estar entre 0 (Compra) y 6 (Despacho)");

            RuleFor(x => x.Quantity)
                .NotNull().WithMessage("La cantidad es requerida")
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0");

            RuleFor(x => x.UnitCost)
                .NotNull().WithMessage("El costo unitario es requerido")
                .GreaterThanOrEqualTo(0).WithMessage("El costo unitario no puede ser negativo");

            // Para ajustes positivos (4) y negativos (5), Notes es obligatorio con mínimo 10 caracteres
            When(x => x.MovementType == 4 || x.MovementType == 5, () =>
            {
                RuleFor(x => x.Notes)
                    .NotNull().WithMessage("La justificación es obligatoria para ajustes de inventario")
                    .NotEmpty().WithMessage("La justificación es obligatoria para ajustes de inventario")
                    .MinimumLength(10).WithMessage("La justificación debe tener al menos 10 caracteres");
            });

            // Para compras (0), UnitCost debe ser mayor a 0
            When(x => x.MovementType == 0, () =>
            {
                RuleFor(x => x.UnitCost)
                    .GreaterThan(0).WithMessage("El costo unitario debe ser mayor a 0 para compras");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es requerido")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
        }
    }
}
