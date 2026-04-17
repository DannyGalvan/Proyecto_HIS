using FluentValidation;
using Hospital.Server.Entities.Request;

namespace Hospital.Server.Validations.Auth
{
    /// <summary>
    /// Defines the <see cref="ChangePasswordValidations" />
    /// </summary>
    public class ChangePasswordValidations : AbstractValidator<ChangePasswordRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ChangePasswordValidations"/> class.
        /// </summary>
        public ChangePasswordValidations()
        {
            RuleFor(c => c.Token)
                .NotEmpty()
                .WithMessage("El token es obligatorio");
            RuleFor(c => c.ConfirmPassword)
                .NotEmpty()
                .WithMessage("La confirmación es obligatoria")
                .Equal(c => c.Password)
                .WithMessage("Las contraseñas no coinciden");
            RuleFor(c => c.Password)
                .NotEmpty()
                .WithMessage("la contraseña es obligatoria")
                .MinimumLength(8).WithMessage("La contraseña debe contener al menos 8 caracteres")
                .Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,25}$")
                .WithMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial, y tener entre 8 y 25 caracteres");
        }
    }
}
