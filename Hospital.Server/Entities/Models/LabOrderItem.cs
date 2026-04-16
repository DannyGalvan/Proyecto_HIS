using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class LabOrderItem : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to LabOrder
        /// </summary>
        public long LabOrderId { get; set; }

        /// <summary>
        /// FK to LabExam catalog
        /// </summary>
        public long LabExamId { get; set; }

        /// <summary>
        /// Exam name (denormalized for historical record)
        /// </summary>
        public string ExamName { get; set; } = string.Empty;

        /// <summary>
        /// Individual exam amount in GTQ
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// Result value entered by lab technician
        /// </summary>
        public string? ResultValue { get; set; }

        /// <summary>
        /// Unit of measurement for the result
        /// </summary>
        public string? ResultUnit { get; set; }

        /// <summary>
        /// Reference range for comparison
        /// </summary>
        public string? ReferenceRange { get; set; }

        /// <summary>
        /// Whether result is out of reference range (RN-CU09-02)
        /// </summary>
        public bool IsOutOfRange { get; set; } = false;

        /// <summary>
        /// Additional notes on result
        /// </summary>
        public string? ResultNotes { get; set; }

        /// <summary>
        /// When the result was recorded
        /// </summary>
        public DateTime? ResultDate { get; set; }

        /// <summary>
        /// Whether result has been published (RNF-024: immutable once published)
        /// </summary>
        public bool IsPublished { get; set; } = false;

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual LabOrder? LabOrder { get; set; }
        public virtual LabExam? LabExam { get; set; }
    }
}
