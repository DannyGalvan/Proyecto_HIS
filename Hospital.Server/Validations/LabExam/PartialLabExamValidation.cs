using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.LabExam
{
    /// <summary>
    /// Defines the <see cref="PartialLabExamValidation" />
    /// </summary>
    public class PartialLabExamValidation : PartialUpdateValidator<LabExamRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialLabExamValidation"/> class.
        /// </summary>
        public PartialLabExamValidation()
        {
            When(x => x.Name != null, () =>
            {
                RuleFor(x => x.Name)
                    .NotEmpty().WithMessage("El nombre del examen no puede estar vacío")
                    .MaximumLength(200).WithMessage("El nombre del examen no puede exceder 200 caracteres");
            });

            When(x => x.Description != null, () =>
            {
                RuleFor(x => x.Description)
                    .NotEmpty().WithMessage("La descripción no puede estar vacía")
                    .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
            });

            When(x => x.DefaultAmount != null, () =>
            {
                RuleFor(x => x.DefaultAmount)
                    .GreaterThan(0).WithMessage("El monto debe ser mayor a cero");
            });

            When(x => x.ReferenceRange != null, () =>
            {
                RuleFor(x => x.ReferenceRange)
                    .NotEmpty().WithMessage("El rango de referencia no puede estar vacío")
                    .MaximumLength(100).WithMessage("El rango de referencia no puede exceder 100 caracteres");
            });

            When(x => x.Unit != null, () =>
            {
                RuleFor(x => x.Unit)
                    .NotEmpty().WithMessage("La unidad de medida no puede estar vacía")
                    .MaximumLength(50).WithMessage("La unidad de medida no puede exceder 50 caracteres");
            });

            When(x => x.LaboratoryId != null, () =>
            {
                RuleFor(x => x.LaboratoryId)
                    .GreaterThan(0).WithMessage("El laboratorio debe ser mayor a cero");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
