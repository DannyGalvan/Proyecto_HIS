using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents the inventory stock of a medicine in a specific branch.
    /// Tracks the current stock level for each medicine per branch location.
    /// RNF-025: Implements optimistic locking using RowVersion for concurrency control.
    /// </summary>
    public class MedicineInventory : IEntity<long>
    {
        /// <summary>
        /// Gets or sets the unique identifier for the medicine inventory record.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Gets or sets the foreign key to the Medicine entity.
        /// </summary>
        public long MedicineId { get; set; }

        /// <summary>
        /// Gets or sets the foreign key to the Branch entity.
        /// </summary>
        public long BranchId { get; set; }

        /// <summary>
        /// Gets or sets the current stock quantity for this medicine in this branch.
        /// Represents the available units in inventory.
        /// </summary>
        public int CurrentStock { get; set; }

        /// <summary>
        /// PostgreSQL xmin system column for optimistic concurrency control (RNF-025).
        /// Automatically managed by the database.
        /// </summary>
        public uint RowVersion { get; set; }

        /// <summary>
        /// Gets or sets the state of the inventory record (active/inactive).
        /// Default: 1 (active).
        /// </summary>
        public int State { get; set; } = 1;

        /// <summary>
        /// Gets or sets the date and time when the inventory record was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the user ID who created the inventory record.
        /// </summary>
        public long CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the user ID who last updated the inventory record.
        /// Nullable for records that have not been updated.
        /// </summary>
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the inventory record was last updated.
        /// Nullable for records that have not been updated.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Gets or sets the navigation property to the related Medicine entity.
        /// </summary>
        public virtual Medicine? Medicine { get; set; }

        /// <summary>
        /// Gets or sets the navigation property to the related Branch entity.
        /// </summary>
        public virtual Branch? Branch { get; set; }
    }
}
