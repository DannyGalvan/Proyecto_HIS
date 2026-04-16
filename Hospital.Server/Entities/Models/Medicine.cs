using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents a medicine entity in the hospital system.
    /// This is a catalog entity for pharmacy medicines management.
    /// </summary>
    public class Medicine : IEntity<long>, ICatalogue
    {
        /// <summary>
        /// Gets or sets the unique identifier for the medicine.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the medicine.
        /// Maximum length: 200 characters.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the description of the medicine.
        /// Maximum length: 500 characters.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the default price of the medicine.
        /// Precision: 10 digits with 2 decimal places.
        /// </summary>
        public decimal DefaultPrice { get; set; }

        /// <summary>
        /// Gets or sets the unit of measurement for the medicine.
        /// Examples: "tableta", "ml", "cápsula".
        /// Maximum length: 50 characters.
        /// </summary>
        public string Unit { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether this medicine is controlled (requires special regulations).
        /// RNF-017: Control flag for regulated medicines.
        /// Default: false.
        /// </summary>
        public bool IsControlled { get; set; } = false;

        /// <summary>
        /// Gets or sets the minimum stock level for this medicine.
        /// RN-CU10-03: Minimum stock requirement.
        /// Default: 0.
        /// </summary>
        public int MinimumStock { get; set; } = 0;

        /// <summary>
        /// Gets or sets the state of the medicine (active/inactive).
        /// Default: 1 (active).
        /// </summary>
        public int State { get; set; } = 1;

        /// <summary>
        /// Gets or sets the date and time when the medicine was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the user ID who created the medicine.
        /// </summary>
        public long CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the user ID who last updated the medicine.
        /// Nullable for records that have not been updated.
        /// </summary>
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the medicine was last updated.
        /// Nullable for records that have not been updated.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
}
