using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class MedicalConsultationRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? AppointmentId { get; set; }
        public long? DoctorId { get; set; }
        public string? ReasonForVisit { get; set; }
        public string? ClinicalFindings { get; set; }
        public string? Diagnosis { get; set; }
        public string? DiagnosisCie10Code { get; set; }
        public string? TreatmentPlan { get; set; }
        public int? ConsultationStatus { get; set; }
        public string? Notes { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
