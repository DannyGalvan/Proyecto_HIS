using FluentValidation;
using Hospital.Server.Entities.Request;

namespace Hospital.Server.Validations.Auth
{
    /// <summary>
    /// Defines the <see cref="ManualChangePasswordValidation" />
    /// </summary>
    public class ManualChangePasswordValidation : AbstractValidator<ManualChangePasswordRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ManualChangePasswordValidation"/> class.
        /// </summary>
        public ManualChangePasswordValidation()
        {
            RuleFor(c => c.CurrentPassword)
                .NotEmpty()
                .WithMessage("La contraseña actual es obligatoria")
                .MinimumLength(8).WithMessage("La contraseña debe contener al menos 8 caracteres")
                .Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,25}$")
                .WithMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial, y tener entre 8 y 25 caracteres");

            RuleFor(c => c.NewPassword)
                .NotEmpty()
                .WithMessage("La nueva contraseña es obligatoria")
                .MinimumLength(8).WithMessage("La contraseña debe contener al menos 8 caracteres")
                .Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,25}$")
                .WithMessage("La nueva contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial, y tener entre 8 y 25 caracteres")
                .NotEqual(c => c.CurrentPassword)
                .WithMessage("La nueva contraseña debe ser diferente a la contraseña actual");

            RuleFor(c => c.ConfirmPassword)
                .NotEmpty()
                .WithMessage("La confirmación de contraseña es obligatoria")
                .Equal(c => c.NewPassword)
                .WithMessage("Las contraseñas no coinciden");
        }
    }
}
