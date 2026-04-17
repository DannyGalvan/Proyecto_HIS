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
                .WithMessage("La contraseña actual es obligatoria");

            RuleFor(c => c.NewPassword)
                .NotEmpty()
                .WithMessage("La nueva contraseña es obligatoria")
                .MinimumLength(12)
                .WithMessage("La nueva contraseña debe tener al menos 12 caracteres")
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
