using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class LabOrder : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to MedicalConsultation that originated this order
        /// </summary>
        public long ConsultationId { get; set; }

        /// <summary>
        /// FK to User (Doctor who ordered)
        /// </summary>
        public long DoctorId { get; set; }

        /// <summary>
        /// FK to User (Patient)
        /// </summary>
        public long PatientId { get; set; }

        /// <summary>
        /// Unique order number (auto-generated)
        /// </summary>
        public string OrderNumber { get; set; } = string.Empty;

        /// <summary>
        /// 0=Pending, 1=Paid, 2=InProgress, 3=Completed, 4=External
        /// </summary>
        public int OrderStatus { get; set; } = 0;

        /// <summary>
        /// Total amount for all exams in GTQ
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// Whether patient chose external lab (CU-09 FA01)
        /// </summary>
        public bool IsExternal { get; set; } = false;

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
        public virtual MedicalConsultation? Consultation { get; set; }
        public virtual User? Doctor { get; set; }
        public virtual User? Patient { get; set; }
        public virtual ICollection<LabOrderItem> Items { get; set; } = new List<LabOrderItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
