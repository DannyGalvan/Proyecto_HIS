using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.LabOrderItem
{
    /// <summary>
    /// Defines the <see cref="PartialLabOrderItemValidation" />
    /// </summary>
    public class PartialLabOrderItemValidation : PartialUpdateValidator<LabOrderItemRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialLabOrderItemValidation"/> class.
        /// </summary>
        public PartialLabOrderItemValidation()
        {
            When(x => x.LabOrderId != null, () =>
            {
                RuleFor(x => x.LabOrderId)
                    .GreaterThan(0).WithMessage("La orden de laboratorio debe ser mayor a cero");
            });

            When(x => x.LabExamId != null, () =>
            {
                RuleFor(x => x.LabExamId)
                    .GreaterThan(0).WithMessage("El examen debe ser mayor a cero");
            });

            When(x => x.ExamName != null, () =>
            {
                RuleFor(x => x.ExamName)
                    .NotEmpty().WithMessage("El nombre del examen no puede estar vacío")
                    .MaximumLength(200).WithMessage("El nombre del examen no puede exceder 200 caracteres");
            });

            When(x => x.Amount != null, () =>
            {
                RuleFor(x => x.Amount)
                    .GreaterThanOrEqualTo(0).WithMessage("El monto debe ser mayor o igual a cero");
            });

            When(x => !string.IsNullOrEmpty(x.ResultValue), () =>
            {
                RuleFor(x => x.ResultValue)
                    .MaximumLength(100).WithMessage("El valor del resultado no puede exceder 100 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.ResultUnit), () =>
            {
                RuleFor(x => x.ResultUnit)
                    .MaximumLength(50).WithMessage("La unidad del resultado no puede exceder 50 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.ReferenceRange), () =>
            {
                RuleFor(x => x.ReferenceRange)
                    .MaximumLength(100).WithMessage("El rango de referencia no puede exceder 100 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.ResultNotes), () =>
            {
                RuleFor(x => x.ResultNotes)
                    .MaximumLength(500).WithMessage("Las notas del resultado no pueden exceder 500 caracteres");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
