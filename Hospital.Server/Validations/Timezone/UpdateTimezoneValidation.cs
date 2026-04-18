using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Timezone
{
    /// <summary>
    /// Defines the <see cref="UpdateTimezoneValidation" />
    /// </summary>
    public class UpdateTimezoneValidation : UpdateValidator<TimezoneRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateTimezoneValidation"/> class.
        /// </summary>
        public UpdateTimezoneValidation()
        {
            RuleFor(x => x.IanaId)
                .NotNull().WithMessage("El identificador IANA es requerido")
                .NotEmpty().WithMessage("El identificador IANA es requerido")
                .MaximumLength(100).WithMessage("El identificador IANA no puede exceder 100 caracteres");

            RuleFor(x => x.DisplayName)
                .NotNull().WithMessage("El nombre de visualización es requerido")
                .NotEmpty().WithMessage("El nombre de visualización es requerido")
                .MaximumLength(200).WithMessage("El nombre de visualización no puede exceder 200 caracteres");

            RuleFor(x => x.UtcOffset)
                .NotNull().WithMessage("El offset UTC es requerido")
                .NotEmpty().WithMessage("El offset UTC es requerido");
        }
    }
}
