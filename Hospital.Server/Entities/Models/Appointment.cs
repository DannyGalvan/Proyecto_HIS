using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class Appointment : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to User (Patient)
        /// </summary>
        public long PatientId { get; set; }

        /// <summary>
        /// FK to User (Doctor) - assigned based on specialty and availability
        /// </summary>
        public long? DoctorId { get; set; }

        /// <summary>
        /// FK to Specialty
        /// </summary>
        public long SpecialtyId { get; set; }

        /// <summary>
        /// FK to Branch
        /// </summary>
        public long BranchId { get; set; }

        /// <summary>
        /// FK to AppointmentStatus
        /// </summary>
        public long AppointmentStatusId { get; set; }

        /// <summary>
        /// Scheduled date and time for the appointment
        /// </summary>
        public DateTime AppointmentDate { get; set; }

        /// <summary>
        /// Reason for the visit (10-2000 chars per RN-CU03-03)
        /// </summary>
        public string Reason { get; set; } = string.Empty;

        /// <summary>
        /// Consultation amount in GTQ
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// Priority level: 0 = Normal, 1 = Urgent, 2 = Emergency (CU-05 FA01)
        /// </summary>
        public int Priority { get; set; } = 0;

        /// <summary>
        /// Actual arrival time registered by receptionist (CU-05)
        /// </summary>
        public DateTime? ArrivalTime { get; set; }

        /// <summary>
        /// Notes added by receptionist or system
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// Follow-up type: null = normal appointment, 0 = ConditionMonitoring, 1 = ResultsReview (CU-11 RN-CU11-01)
        /// </summary>
        public int? FollowUpType { get; set; }

        /// <summary>
        /// FK to MedicalConsultation that originated this follow-up (CU-11)
        /// </summary>
        public long? ParentConsultationId { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User? Patient { get; set; }
        public virtual User? Doctor { get; set; }
        public virtual Specialty? Specialty { get; set; }
        public virtual Branch? Branch { get; set; }
        public virtual AppointmentStatus? AppointmentStatus { get; set; }
        public virtual MedicalConsultation? ParentConsultation { get; set; }
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public virtual ICollection<AppointmentDocument> Documents { get; set; } = new List<AppointmentDocument>();
    }
}
