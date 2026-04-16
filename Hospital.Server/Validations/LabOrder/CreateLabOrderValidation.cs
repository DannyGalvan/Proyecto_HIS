using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.LabOrder
{
    /// <summary>
    /// Defines the <see cref="CreateLabOrderValidation" />
    /// </summary>
    public class CreateLabOrderValidation : CreateValidator<LabOrderRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateLabOrderValidation"/> class.
        /// </summary>
        public CreateLabOrderValidation()
        {
            RuleFor(x => x.ConsultationId)
                .NotNull().WithMessage("La consulta asociada es obligatoria")
                .GreaterThan(0).WithMessage("La consulta debe ser mayor a cero");

            RuleFor(x => x.DoctorId)
                .NotNull().WithMessage("El médico es obligatorio")
                .GreaterThan(0).WithMessage("El médico debe ser mayor a cero");

            RuleFor(x => x.PatientId)
                .NotNull().WithMessage("El paciente es obligatorio")
                .GreaterThan(0).WithMessage("El paciente debe ser mayor a cero");

            RuleFor(x => x.OrderStatus)
                .NotNull().WithMessage("El estado de la orden es obligatorio")
                .InclusiveBetween(0, 4).WithMessage("El estado debe ser 0 (Pendiente), 1 (Pagada), 2 (En Proceso), 3 (Completada) o 4 (Externa)");

            RuleFor(x => x.TotalAmount)
                .NotNull().WithMessage("El monto total es obligatorio")
                .GreaterThanOrEqualTo(0).WithMessage("El monto total debe ser mayor o igual a cero");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
