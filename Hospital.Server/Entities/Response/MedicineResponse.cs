namespace Hospital.Server.Entities.Response
{
    /// <summary>
    /// Response model for medicine entity.
    /// CreatedAt and UpdatedAt are formatted as strings via Mapster configuration.
    /// </summary>
    public class MedicineResponse
    {
        /// <summary>
        /// Gets or sets the unique identifier for the medicine.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the medicine.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the description of the medicine.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the default price of the medicine.
        /// </summary>
        public decimal DefaultPrice { get; set; }

        /// <summary>
        /// Gets or sets the unit of measurement for the medicine.
        /// </summary>
        public string Unit { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether this medicine is controlled.
        /// </summary>
        public bool IsControlled { get; set; }

        /// <summary>
        /// Gets or sets the minimum stock level for this medicine.
        /// </summary>
        public int MinimumStock { get; set; }

        /// <summary>
        /// Gets or sets the state of the medicine.
        /// </summary>
        public int State { get; set; }

        /// <summary>
        /// Gets or sets the creation date as a formatted string.
        /// </summary>
        public string CreatedAt { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the user ID who created the medicine.
        /// </summary>
        public long CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the user ID who last updated the medicine.
        /// </summary>
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the last update date as a formatted string.
        /// </summary>
        public string? UpdatedAt { get; set; }
    }
}
