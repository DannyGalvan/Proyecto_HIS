using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Branch
{
    public class CreateBranchValidation : CreateValidator<BranchRequest, long?>
    {
        public CreateBranchValidation()
        {
            RuleFor(x => x.Name)
                .NotNull().WithMessage("El nombre es obligatorio")
                .NotEmpty().WithMessage("El nombre no puede estar vacío")
                .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres");

            RuleFor(x => x.Phone)
                .NotNull().WithMessage("El teléfono es obligatorio")
                .NotEmpty().WithMessage("El teléfono no puede estar vacío")
                .Matches(@"^\d{8}$").WithMessage("El teléfono debe contener exactamente 8 dígitos numéricos");

            RuleFor(x => x.Address)
                .NotNull().WithMessage("La dirección es obligatoria")
                .NotEmpty().WithMessage("La dirección no puede estar vacía")
                .MaximumLength(500).WithMessage("La dirección no debe exceder los 500 caracteres");

            RuleFor(x => x.Description)
                .NotNull().WithMessage("La descripción es obligatoria")
                .NotEmpty().WithMessage("La descripción no puede estar vacía")
                .MaximumLength(250).WithMessage("La descripción no debe exceder los 250 caracteres");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
