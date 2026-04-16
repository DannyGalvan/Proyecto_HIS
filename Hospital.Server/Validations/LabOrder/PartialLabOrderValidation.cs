using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.LabOrder
{
    /// <summary>
    /// Defines the <see cref="PartialLabOrderValidation" />
    /// </summary>
    public class PartialLabOrderValidation : PartialUpdateValidator<LabOrderRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialLabOrderValidation"/> class.
        /// </summary>
        public PartialLabOrderValidation()
        {
            When(x => x.ConsultationId != null, () =>
            {
                RuleFor(x => x.ConsultationId)
                    .GreaterThan(0).WithMessage("La consulta debe ser mayor a cero");
            });

            When(x => x.DoctorId != null, () =>
            {
                RuleFor(x => x.DoctorId)
                    .GreaterThan(0).WithMessage("El médico debe ser mayor a cero");
            });

            When(x => x.PatientId != null, () =>
            {
                RuleFor(x => x.PatientId)
                    .GreaterThan(0).WithMessage("El paciente debe ser mayor a cero");
            });

            When(x => x.OrderStatus != null, () =>
            {
                RuleFor(x => x.OrderStatus)
                    .InclusiveBetween(0, 4).WithMessage("El estado debe ser 0 (Pendiente), 1 (Pagada), 2 (En Proceso), 3 (Completada) o 4 (Externa)");
            });

            When(x => x.TotalAmount != null, () =>
            {
                RuleFor(x => x.TotalAmount)
                    .GreaterThanOrEqualTo(0).WithMessage("El monto total debe ser mayor o igual a cero");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
