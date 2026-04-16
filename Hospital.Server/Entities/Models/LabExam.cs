using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class LabExam : IEntity<long>, ICatalogue
    {
        public long Id { get; set; }

        /// <summary>
        /// Exam name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Exam description
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Default price in GTQ
        /// </summary>
        public decimal DefaultAmount { get; set; }

        /// <summary>
        /// Reference range display (e.g. "70-100 mg/dL")
        /// </summary>
        public string ReferenceRange { get; set; } = string.Empty;

        /// <summary>
        /// Unit of measurement (e.g. "mg/dL", "g/dL", "mmol/L")
        /// </summary>
        public string Unit { get; set; } = string.Empty;

        /// <summary>
        /// FK to Laboratory where this exam is performed
        /// </summary>
        public long? LaboratoryId { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Laboratory? Laboratory { get; set; }
    }
}
