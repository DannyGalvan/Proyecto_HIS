using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Branch
{
    public class PartialBranchValidation : PartialUpdateValidator<BranchRequest, long?>
    {
        public PartialBranchValidation()
        {
            When(x => !string.IsNullOrEmpty(x.Name), () =>
            {
                RuleFor(x => x.Name)
                    .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.Phone), () =>
            {
                RuleFor(x => x.Phone)
                    .Matches(@"^\d{8}$").WithMessage("El teléfono debe contener exactamente 8 dígitos numéricos");
            });

            When(x => !string.IsNullOrEmpty(x.Address), () =>
            {
                RuleFor(x => x.Address)
                    .MaximumLength(500).WithMessage("La dirección no debe exceder los 500 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.Description), () =>
            {
                RuleFor(x => x.Description)
                    .MaximumLength(250).WithMessage("La descripción no debe exceder los 250 caracteres");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
