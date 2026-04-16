using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents a pharmacy dispense order linked to a prescription.
    /// </summary>
    public class Dispense : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to Prescription
        /// </summary>
        public long PrescriptionId { get; set; }

        /// <summary>
        /// FK to User (Patient)
        /// </summary>
        public long PatientId { get; set; }

        /// <summary>
        /// FK to User (Pharmacist)
        /// </summary>
        public long PharmacistId { get; set; }

        /// <summary>
        /// Dispense status: 0=Pending, 1=Paid, 2=Dispensed, 3=PartiallyDispensed, 4=Declined
        /// </summary>
        public int DispenseStatus { get; set; } = 0;

        /// <summary>
        /// Total amount for the dispense
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// Additional notes for the dispense
        /// </summary>
        public string? Notes { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Prescription? Prescription { get; set; }
        public virtual User? Patient { get; set; }
        public virtual User? Pharmacist { get; set; }
        public virtual ICollection<DispenseItem> Items { get; set; } = new List<DispenseItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
