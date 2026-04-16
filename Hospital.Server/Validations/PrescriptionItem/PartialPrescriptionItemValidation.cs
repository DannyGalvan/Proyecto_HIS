using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.PrescriptionItem
{
    /// <summary>
    /// Defines the <see cref="PartialPrescriptionItemValidation" />
    /// </summary>
    public class PartialPrescriptionItemValidation : PartialUpdateValidator<PrescriptionItemRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialPrescriptionItemValidation"/> class.
        /// </summary>
        public PartialPrescriptionItemValidation()
        {
            When(x => x.PrescriptionId != null, () =>
            {
                RuleFor(x => x.PrescriptionId)
                    .GreaterThan(0).WithMessage("La receta asociada debe ser mayor a 0");
            });

            When(x => x.MedicineName != null, () =>
            {
                RuleFor(x => x.MedicineName)
                    .NotEmpty().WithMessage("El medicamento no puede estar vacío")
                    .MaximumLength(200).WithMessage("El nombre del medicamento no debe exceder los 200 caracteres");
            });

            When(x => x.Dosage != null, () =>
            {
                RuleFor(x => x.Dosage)
                    .NotEmpty().WithMessage("La dosis no puede estar vacía")
                    .MaximumLength(200).WithMessage("La dosis no debe exceder los 200 caracteres");
            });

            When(x => x.Frequency != null, () =>
            {
                RuleFor(x => x.Frequency)
                    .NotEmpty().WithMessage("La frecuencia no puede estar vacía")
                    .MaximumLength(200).WithMessage("La frecuencia no debe exceder los 200 caracteres");
            });

            When(x => x.Duration != null, () =>
            {
                RuleFor(x => x.Duration)
                    .NotEmpty().WithMessage("La duración no puede estar vacía")
                    .MaximumLength(200).WithMessage("La duración no debe exceder los 200 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.SpecialInstructions), () =>
            {
                RuleFor(x => x.SpecialInstructions)
                    .MaximumLength(500).WithMessage("Las instrucciones especiales no deben exceder los 500 caracteres");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
            });
        }
    }
}
