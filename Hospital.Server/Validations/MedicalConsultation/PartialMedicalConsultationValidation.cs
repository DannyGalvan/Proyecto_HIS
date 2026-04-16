using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.MedicalConsultation
{
    /// <summary>
    /// Defines the <see cref="PartialMedicalConsultationValidation" />
    /// </summary>
    public class PartialMedicalConsultationValidation : PartialUpdateValidator<MedicalConsultationRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialMedicalConsultationValidation"/> class.
        /// </summary>
        public PartialMedicalConsultationValidation()
        {
            When(x => x.AppointmentId != null, () =>
            {
                RuleFor(x => x.AppointmentId)
                    .GreaterThan(0).WithMessage("La cita debe ser mayor a 0");
            });

            When(x => x.DoctorId != null, () =>
            {
                RuleFor(x => x.DoctorId)
                    .GreaterThan(0).WithMessage("El médico debe ser mayor a 0");
            });

            When(x => x.ReasonForVisit != null, () =>
            {
                RuleFor(x => x.ReasonForVisit)
                    .NotEmpty().WithMessage("El motivo de consulta no puede estar vacío")
                    .MinimumLength(10).WithMessage("El motivo de consulta debe contener al menos 10 caracteres")
                    .MaximumLength(5000).WithMessage("El motivo de consulta no puede exceder 5000 caracteres");
            });

            When(x => x.ClinicalFindings != null, () =>
            {
                RuleFor(x => x.ClinicalFindings)
                    .NotEmpty().WithMessage("Los hallazgos clínicos no pueden estar vacíos")
                    .MaximumLength(5000).WithMessage("Los hallazgos clínicos no pueden exceder 5000 caracteres");
            });

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

            When(x => x.ConsultationStatus != null, () =>
            {
                RuleFor(x => x.ConsultationStatus)
                    .InclusiveBetween(0, 1).WithMessage("El estado de la consulta debe ser 0 (En curso) o 1 (Finalizada)");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
            });
        }
    }
}
