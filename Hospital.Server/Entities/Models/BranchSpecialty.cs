using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Junction entity that represents which specialties are offered at a given branch.
    /// A branch can offer many specialties and a specialty can be offered at many branches.
    /// </summary>
    public class BranchSpecialty : IEntity<long>
    {
        /// <summary>Gets or sets the Id</summary>
        public long Id { get; set; }

        /// <summary>Gets or sets the BranchId (FK → Branch)</summary>
        public long BranchId { get; set; }

        /// <summary>Gets or sets the SpecialtyId (FK → Specialty)</summary>
        public long SpecialtyId { get; set; }

        /// <summary>Gets or sets the State (1 = active, 0 = inactive)</summary>
        public int State { get; set; } = 1;

        /// <summary>Gets or sets the CreatedAt</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Gets or sets the CreatedBy</summary>
        public long CreatedBy { get; set; }

        /// <summary>Gets or sets the UpdatedBy</summary>
        public long? UpdatedBy { get; set; }

        /// <summary>Gets or sets the UpdatedAt</summary>
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        /// <summary>Gets or sets the Branch navigation property</summary>
        public virtual Branch? Branch { get; set; }

        /// <summary>Gets or sets the Specialty navigation property</summary>
        public virtual Specialty? Specialty { get; set; }
    }
}
