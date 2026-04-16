using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Specialty
{
    public class PartialSpecialtyValidation : PartialUpdateValidator<SpecialtyRequest, long?>
    {
        public PartialSpecialtyValidation()
        {
            When(x => !string.IsNullOrEmpty(x.Name), () =>
            {
                RuleFor(x => x.Name)
                    .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres");
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
