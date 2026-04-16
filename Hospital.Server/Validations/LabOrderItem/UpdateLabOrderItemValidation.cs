using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.LabOrderItem
{
    /// <summary>
    /// Defines the <see cref="UpdateLabOrderItemValidation" />
    /// </summary>
    public class UpdateLabOrderItemValidation : UpdateValidator<LabOrderItemRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateLabOrderItemValidation"/> class.
        /// </summary>
        public UpdateLabOrderItemValidation()
        {
            RuleFor(x => x.LabOrderId)
                .NotNull().WithMessage("La orden de laboratorio es obligatoria")
                .GreaterThan(0).WithMessage("La orden de laboratorio debe ser mayor a cero");

            RuleFor(x => x.LabExamId)
                .NotNull().WithMessage("El examen es obligatorio")
                .GreaterThan(0).WithMessage("El examen debe ser mayor a cero");

            RuleFor(x => x.ExamName)
                .NotNull().WithMessage("El nombre del examen es obligatorio")
                .NotEmpty().WithMessage("El nombre del examen no puede estar vacío")
                .MaximumLength(200).WithMessage("El nombre del examen no puede exceder 200 caracteres");

            RuleFor(x => x.Amount)
                .NotNull().WithMessage("El monto es obligatorio")
                .GreaterThanOrEqualTo(0).WithMessage("El monto debe ser mayor o igual a cero");

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

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
