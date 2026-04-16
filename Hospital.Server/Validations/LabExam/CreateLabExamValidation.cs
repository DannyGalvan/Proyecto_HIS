using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.LabExam
{
    /// <summary>
    /// Defines the <see cref="CreateLabExamValidation" />
    /// </summary>
    public class CreateLabExamValidation : CreateValidator<LabExamRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateLabExamValidation"/> class.
        /// </summary>
        public CreateLabExamValidation()
        {
            RuleFor(x => x.Name)
                .NotNull().WithMessage("El nombre del examen es obligatorio")
                .NotEmpty().WithMessage("El nombre del examen no puede estar vacío")
                .MaximumLength(200).WithMessage("El nombre del examen no puede exceder 200 caracteres");

            RuleFor(x => x.Description)
                .NotNull().WithMessage("La descripción es obligatoria")
                .NotEmpty().WithMessage("La descripción no puede estar vacía")
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");

            RuleFor(x => x.DefaultAmount)
                .NotNull().WithMessage("El monto del examen es obligatorio")
                .GreaterThan(0).WithMessage("El monto debe ser mayor a cero");

            RuleFor(x => x.ReferenceRange)
                .NotNull().WithMessage("El rango de referencia es obligatorio")
                .NotEmpty().WithMessage("El rango de referencia no puede estar vacío")
                .MaximumLength(100).WithMessage("El rango de referencia no puede exceder 100 caracteres");

            RuleFor(x => x.Unit)
                .NotNull().WithMessage("La unidad de medida es obligatoria")
                .NotEmpty().WithMessage("La unidad de medida no puede estar vacía")
                .MaximumLength(50).WithMessage("La unidad de medida no puede exceder 50 caracteres");

            When(x => x.LaboratoryId != null, () =>
            {
                RuleFor(x => x.LaboratoryId)
                    .GreaterThan(0).WithMessage("El laboratorio debe ser mayor a cero");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
