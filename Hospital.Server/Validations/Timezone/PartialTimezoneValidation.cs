using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Timezone
{
    /// <summary>
    /// Defines the <see cref="PartialTimezoneValidation" />
    /// </summary>
    public class PartialTimezoneValidation : PartialUpdateValidator<TimezoneRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialTimezoneValidation"/> class.
        /// </summary>
        public PartialTimezoneValidation()
        {
            When(x => x.IanaId != null, () =>
            {
                RuleFor(x => x.IanaId)
                    .MaximumLength(100).WithMessage("El identificador IANA no puede exceder 100 caracteres");
            });

            When(x => x.DisplayName != null, () =>
            {
                RuleFor(x => x.DisplayName)
                    .MaximumLength(200).WithMessage("El nombre de visualización no puede exceder 200 caracteres");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
            });
        }
    }
}
