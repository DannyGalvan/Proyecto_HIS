using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Prescription
{
    /// <summary>
    /// Defines the <see cref="UpdatePrescriptionValidation" />
    /// </summary>
    public class UpdatePrescriptionValidation : UpdateValidator<PrescriptionRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdatePrescriptionValidation"/> class.
        /// </summary>
        public UpdatePrescriptionValidation()
        {
            RuleFor(x => x.ConsultationId)
                .NotNull().WithMessage("La consulta asociada es obligatoria")
                .GreaterThan(0).WithMessage("La consulta asociada debe ser mayor a 0");

            RuleFor(x => x.DoctorId)
                .NotNull().WithMessage("El médico es obligatorio")
                .GreaterThan(0).WithMessage("El médico debe ser mayor a 0");

            RuleFor(x => x.PrescriptionDate)
                .NotNull().WithMessage("La fecha de la receta es obligatoria");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es requerido")
                .InclusiveBetween(0, 1).WithMessage("El estado debe estar entre 0 y 1");
        }
    }
}
