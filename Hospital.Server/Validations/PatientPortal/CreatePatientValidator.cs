using FluentValidation;
using Hospital.Server.Entities.Request;

namespace Hospital.Server.Validations.PatientPortal
{
    /// <summary>
    /// Validator for <see cref="PatientRegisterRequest"/>.
    /// Inherits directly from AbstractValidator because PatientRegisterRequest
    /// is a standalone DTO (not an IRequest&lt;long&gt;) used only by the public
    /// patient-portal registration endpoint.
    /// </summary>
    public class CreatePatientValidator : AbstractValidator<PatientRegisterRequest>
    {
        public CreatePatientValidator()
        {
            // Name: 10–100 characters, required
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre completo es requerido")
                .Length(10, 100).WithMessage("El nombre completo debe tener entre 10 y 100 caracteres");

            // DPI: exactly 13 numeric digits, required
            RuleFor(x => x.Dpi)
                .NotEmpty().WithMessage("El DPI es requerido")
                .Matches(@"^\d{13}$").WithMessage("El DPI debe contener exactamente 13 dígitos numéricos");

            // UserName: 8–9 characters, required
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("El nombre de usuario es requerido")
                .Length(8, 9).WithMessage("El nombre de usuario debe tener entre 8 y 9 caracteres");

            // Password: minimum 12 characters, required
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("La contraseña es requerida")
                .MinimumLength(12).WithMessage("La contraseña debe tener al menos 12 caracteres");

            // Email: valid format, required
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("El correo electrónico es requerido")
                .EmailAddress().WithMessage("El correo electrónico no tiene un formato válido");

            // Number (phone): exactly 8 numeric digits, required
            RuleFor(x => x.Number)
                .NotEmpty().WithMessage("El número de teléfono es requerido")
                .Matches(@"^\d{8}$").WithMessage("El número de teléfono debe contener exactamente 8 dígitos numéricos");

            // Nit: optional — when provided must be 8–9 alphanumeric characters
            When(x => !string.IsNullOrEmpty(x.Nit), () =>
            {
                RuleFor(x => x.Nit)
                    .Length(8, 9).WithMessage("El NIT debe contener entre 8 y 9 caracteres")
                    .Matches(@"^[a-zA-Z0-9]+$").WithMessage("El NIT debe contener únicamente caracteres alfanuméricos");
            });

            // InsuranceNumber: optional — when provided must be 5–50 characters
            When(x => !string.IsNullOrEmpty(x.InsuranceNumber), () =>
            {
                RuleFor(x => x.InsuranceNumber)
                    .Length(5, 50).WithMessage("El número de seguro médico debe tener entre 5 y 50 caracteres");
            });
        }
    }
}
