using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.PrescriptionItem
{
    /// <summary>
    /// Defines the <see cref="CreatePrescriptionItemValidation" />
    /// </summary>
    public class CreatePrescriptionItemValidation : CreateValidator<PrescriptionItemRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreatePrescriptionItemValidation"/> class.
        /// </summary>
        public CreatePrescriptionItemValidation()
        {
            RuleFor(x => x.PrescriptionId)
                .NotNull().WithMessage("La receta asociada es obligatoria")
                .GreaterThan(0).WithMessage("La receta asociada debe ser mayor a 0");

            RuleFor(x => x.MedicineName)
                .NotNull().WithMessage("El medicamento es obligatorio")
                .NotEmpty().WithMessage("El medicamento es obligatorio")
                .MaximumLength(200).WithMessage("El nombre del medicamento no debe exceder los 200 caracteres");

            RuleFor(x => x.Dosage)
                .NotNull().WithMessage("La dosis es obligatoria")
                .NotEmpty().WithMessage("La dosis es obligatoria")
                .MaximumLength(200).WithMessage("La dosis no debe exceder los 200 caracteres");

            RuleFor(x => x.Frequency)
                .NotNull().WithMessage("La frecuencia es obligatoria")
                .NotEmpty().WithMessage("La frecuencia es obligatoria")
                .MaximumLength(200).WithMessage("La frecuencia no debe exceder los 200 caracteres");

            RuleFor(x => x.Duration)
                .NotNull().WithMessage("La duración es obligatoria")
                .NotEmpty().WithMessage("La duración es obligatoria")
                .MaximumLength(200).WithMessage("La duración no debe exceder los 200 caracteres");

            When(x => !string.IsNullOrEmpty(x.SpecialInstructions), () =>
            {
                RuleFor(x => x.SpecialInstructions)
                    .MaximumLength(500).WithMessage("Las instrucciones especiales no deben exceder los 500 caracteres");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es requerido")
                .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
        }
    }
}
