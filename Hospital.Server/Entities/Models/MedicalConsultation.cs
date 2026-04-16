using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class MedicalConsultation : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to Appointment (one consultation per appointment)
        /// </summary>
        public long AppointmentId { get; set; }

        /// <summary>
        /// FK to User (Doctor)
        /// </summary>
        public long DoctorId { get; set; }

        /// <summary>
        /// Reason for the visit / chief complaint (RN-CU08-02)
        /// </summary>
        public string ReasonForVisit { get; set; } = string.Empty;

        /// <summary>
        /// Clinical findings from physical examination (RN-CU08-02)
        /// </summary>
        public string ClinicalFindings { get; set; } = string.Empty;

        /// <summary>
        /// Diagnosis text (RN-CU08-01: 10-5000 chars, required to close)
        /// </summary>
        public string? Diagnosis { get; set; }

        /// <summary>
        /// Optional CIE-10 code
        /// </summary>
        public string? DiagnosisCie10Code { get; set; }

        /// <summary>
        /// Treatment plan (RN-CU08-02)
        /// </summary>
        public string? TreatmentPlan { get; set; }

        /// <summary>
        /// 0 = InProgress, 1 = Completed (cannot complete without Diagnosis)
        /// </summary>
        public int ConsultationStatus { get; set; } = 0;

        /// <summary>
        /// Additional notes
        /// </summary>
        public string? Notes { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Appointment? Appointment { get; set; }
        public virtual User? Doctor { get; set; }
        public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
        public virtual ICollection<LabOrder> LabOrders { get; set; } = new List<LabOrder>();
    }
}
