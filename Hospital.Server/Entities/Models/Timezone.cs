using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents a timezone entry in the IANA timezone catalog.
    /// </summary>
    public class Timezone : IEntity<long>
    {
        /// <summary>
        /// Gets or sets the unique identifier for the timezone.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Gets or sets the IANA timezone identifier (e.g., "America/Guatemala").
        /// </summary>
        public string IanaId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the display name (e.g., "(UTC-06:00) America/Guatemala").
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the UTC offset string (e.g., "-06:00").
        /// </summary>
        public string UtcOffset { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the state of the record (active/inactive). Default: 1 (active).
        /// </summary>
        public int State { get; set; } = 1;

        /// <summary>
        /// Gets or sets the date and time when the record was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the user ID who created the record.
        /// </summary>
        public long CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the user ID who last updated the record.
        /// </summary>
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the record was last updated.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
}
