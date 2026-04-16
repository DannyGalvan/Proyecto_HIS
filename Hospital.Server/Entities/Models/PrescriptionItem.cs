using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class PrescriptionItem : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to Prescription
        /// </summary>
        public long PrescriptionId { get; set; }

        /// <summary>
        /// Medicine name (RN-CU08-03: required)
        /// </summary>
        public string MedicineName { get; set; } = string.Empty;

        /// <summary>
        /// Dosage (RN-CU08-03: required)
        /// </summary>
        public string Dosage { get; set; } = string.Empty;

        /// <summary>
        /// Frequency (RN-CU08-03: required)
        /// </summary>
        public string Frequency { get; set; } = string.Empty;

        /// <summary>
        /// Duration (RN-CU08-03: required)
        /// </summary>
        public string Duration { get; set; } = string.Empty;

        /// <summary>
        /// Special instructions (RN-CU08-03: optional)
        /// </summary>
        public string? SpecialInstructions { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Prescription? Prescription { get; set; }
    }
}
