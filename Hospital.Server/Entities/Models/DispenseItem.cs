using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents a detail line per dispensed medicine.
    /// </summary>
    public class DispenseItem : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to Dispense
        /// </summary>
        public long DispenseId { get; set; }

        /// <summary>
        /// FK to Medicine
        /// </summary>
        public long MedicineId { get; set; }

        /// <summary>
        /// FK to PrescriptionItem (nullable for manual adds)
        /// </summary>
        public long? PrescriptionItemId { get; set; }

        /// <summary>
        /// Original medicine name from prescription
        /// </summary>
        public string OriginalMedicineName { get; set; } = string.Empty;

        /// <summary>
        /// Actual dispensed medicine name (may differ from original)
        /// </summary>
        public string DispensedMedicineName { get; set; } = string.Empty;

        /// <summary>
        /// Quantity dispensed
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// Unit price of the medicine
        /// </summary>
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// Whether the medicine was substituted
        /// </summary>
        public bool WasSubstituted { get; set; } = false;

        /// <summary>
        /// Reason for substitution if applicable
        /// </summary>
        public string? SubstitutionReason { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Dispense? Dispense { get; set; }
        public virtual Medicine? Medicine { get; set; }
        public virtual PrescriptionItem? PrescriptionItem { get; set; }
    }
}
