using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.MedicineInventory
{
    /// <summary>
    /// Defines the <see cref="UpdateMedicineInventoryValidation" />
    /// </summary>
    public class UpdateMedicineInventoryValidation : UpdateValidator<MedicineInventoryRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateMedicineInventoryValidation"/> class.
        /// </summary>
        public UpdateMedicineInventoryValidation()
        {
            RuleFor(x => x.MedicineId)
                .NotNull().WithMessage("El medicamento es requerido")
                .GreaterThan(0).WithMessage("El medicamento debe ser mayor a 0");

            RuleFor(x => x.BranchId)
                .NotNull().WithMessage("La sucursal es requerida")
                .GreaterThan(0).WithMessage("La sucursal debe ser mayor a 0");

            RuleFor(x => x.CurrentStock)
                .NotNull().WithMessage("El stock actual es requerido")
                .GreaterThanOrEqualTo(0).WithMessage("El stock actual no puede ser negativo");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es requerido")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
        }
    }
}
