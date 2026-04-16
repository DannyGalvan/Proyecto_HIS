using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class Prescription : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to MedicalConsultation
        /// </summary>
        public long ConsultationId { get; set; }

        /// <summary>
        /// FK to User (Doctor who prescribed)
        /// </summary>
        public long DoctorId { get; set; }

        /// <summary>
        /// Date the prescription was issued
        /// </summary>
        public DateTime PrescriptionDate { get; set; }

        /// <summary>
        /// Additional notes for the prescription
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
        public virtual ICollection<PrescriptionItem> Items { get; set; } = new List<PrescriptionItem>();
    }
}
