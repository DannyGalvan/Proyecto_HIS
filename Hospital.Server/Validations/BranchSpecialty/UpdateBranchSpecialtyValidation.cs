using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.BranchSpecialty
{
    public class UpdateBranchSpecialtyValidation : UpdateValidator<BranchSpecialtyRequest, long?>
    {
        public UpdateBranchSpecialtyValidation()
        {
            RuleFor(x => x.BranchId)
                .NotNull().WithMessage("La sede es obligatoria")
                .GreaterThan(0).WithMessage("Debe seleccionar una sede válida");

            RuleFor(x => x.SpecialtyId)
                .NotNull().WithMessage("La especialidad es obligatoria")
                .GreaterThan(0).WithMessage("Debe seleccionar una especialidad válida");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
