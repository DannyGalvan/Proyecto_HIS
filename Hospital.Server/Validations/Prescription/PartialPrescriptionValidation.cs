using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Prescription
{
    /// <summary>
    /// Defines the <see cref="PartialPrescriptionValidation" />
    /// </summary>
    public class PartialPrescriptionValidation : PartialUpdateValidator<PrescriptionRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialPrescriptionValidation"/> class.
        /// </summary>
        public PartialPrescriptionValidation()
        {
            When(x => x.ConsultationId != null, () =>
            {
                RuleFor(x => x.ConsultationId)
                    .GreaterThan(0).WithMessage("La consulta asociada debe ser mayor a 0");
            });

            When(x => x.DoctorId != null, () =>
            {
                RuleFor(x => x.DoctorId)
                    .GreaterThan(0).WithMessage("El médico debe ser mayor a 0");
            });

            When(x => x.PrescriptionDate != null, () =>
            {
                RuleFor(x => x.PrescriptionDate)
                    .NotNull().WithMessage("La fecha de la receta no puede estar vacía");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
            });
        }
    }
}
