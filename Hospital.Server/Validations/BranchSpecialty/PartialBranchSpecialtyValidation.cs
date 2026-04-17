using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.BranchSpecialty
{
    public class PartialBranchSpecialtyValidation : PartialUpdateValidator<BranchSpecialtyRequest, long?>
    {
        public PartialBranchSpecialtyValidation()
        {
            When(x => x.BranchId != null, () =>
            {
                RuleFor(x => x.BranchId)
                    .GreaterThan(0).WithMessage("Debe seleccionar una sede válida");
            });

            When(x => x.SpecialtyId != null, () =>
            {
                RuleFor(x => x.SpecialtyId)
                    .GreaterThan(0).WithMessage("Debe seleccionar una especialidad válida");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
