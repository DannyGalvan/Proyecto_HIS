using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.MedicineInventory
{
    /// <summary>
    /// Defines the <see cref="PartialMedicineInventoryValidation" />
    /// </summary>
    public class PartialMedicineInventoryValidation : PartialUpdateValidator<MedicineInventoryRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialMedicineInventoryValidation"/> class.
        /// </summary>
        public PartialMedicineInventoryValidation()
        {
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

            When(x => x.CurrentStock != null, () =>
            {
                RuleFor(x => x.CurrentStock)
                    .GreaterThanOrEqualTo(0).WithMessage("El stock actual no puede ser negativo");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
            });
        }
    }
}
