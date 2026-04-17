namespace Hospital.Server.Entities.Response
{
    public class MedicalConsultationResponse
    {
        public long Id { get; set; }
        public long AppointmentId { get; set; }
        public long DoctorId { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;
        public string ClinicalFindings { get; set; } = string.Empty;
        public string? Diagnosis { get; set; }
        public string? DiagnosisCie10Code { get; set; }
        public string? TreatmentPlan { get; set; }
        public int ConsultationStatus { get; set; }
        public string? Notes { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }

        // Navigation
        public virtual UserResponse? Doctor { get; set; }
    }
}
