using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.MedicalConsultation
{
    /// <summary>
    /// Defines the <see cref="UpdateMedicalConsultationValidation" />
    /// </summary>
    public class UpdateMedicalConsultationValidation : UpdateValidator<MedicalConsultationRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateMedicalConsultationValidation"/> class.
        /// </summary>
        public UpdateMedicalConsultationValidation()
        {
            RuleFor(x => x.AppointmentId)
                .NotNull().WithMessage("La cita asociada es obligatoria")
                .GreaterThan(0).WithMessage("La cita debe ser mayor a 0");

            RuleFor(x => x.DoctorId)
                .NotNull().WithMessage("El médico es obligatorio")
                .GreaterThan(0).WithMessage("El médico debe ser mayor a 0");

            RuleFor(x => x.ReasonForVisit)
                .NotNull().WithMessage("El motivo de consulta es obligatorio")
                .NotEmpty().WithMessage("El motivo de consulta es obligatorio")
                .MinimumLength(10).WithMessage("El motivo de consulta debe contener al menos 10 caracteres")
                .MaximumLength(5000).WithMessage("El motivo de consulta no puede exceder 5000 caracteres");

            RuleFor(x => x.ClinicalFindings)
                .NotNull().WithMessage("Los hallazgos clínicos son obligatorios")
                .NotEmpty().WithMessage("Los hallazgos clínicos son obligatorios")
                .MaximumLength(5000).WithMessage("Los hallazgos clínicos no pueden exceder 5000 caracteres");

            When(x => !string.IsNullOrEmpty(x.Diagnosis), () =>
            {
                RuleFor(x => x.Diagnosis)
                    .MinimumLength(10).WithMessage("El diagnóstico debe contener entre 10 y 5000 caracteres")
                    .MaximumLength(5000).WithMessage("El diagnóstico debe contener entre 10 y 5000 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.DiagnosisCie10Code), () =>
            {
                RuleFor(x => x.DiagnosisCie10Code)
                    .MaximumLength(10).WithMessage("El código CIE-10 no puede exceder 10 caracteres");
            });

            When(x => !string.IsNullOrEmpty(x.TreatmentPlan), () =>
            {
                RuleFor(x => x.TreatmentPlan)
                    .MaximumLength(5000).WithMessage("El plan de tratamiento no puede exceder 5000 caracteres");
            });

            RuleFor(x => x.ConsultationStatus)
                .NotNull().WithMessage("El estado de la consulta es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado de la consulta debe ser 0 (En curso) o 1 (Finalizada)");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
        }
    }
}
