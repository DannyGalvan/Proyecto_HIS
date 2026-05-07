using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Defines the <see cref="RolOperation" />
    /// </summary>
    public class RolOperation : IEntity<long>
    {
        /// <summary>
        /// Gets or sets the Id
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Gets or sets the RolId
        /// </summary>
        public long RolId { get; set; }

        /// <summary>
        /// Gets or sets the OperationId
        /// </summary>
        public long OperationId { get; set; }

        /// <summary>
        /// Gets or sets the State
        /// </summary>
        public int State { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the operation is visible
        /// in the role's UI (e.g., menu/sidebar). When false, the permission
        /// still applies (the endpoint can be called) but the module should
        /// not appear in the navigation for this role.
        /// </summary>
        public bool IsVisible { get; set; } = true;

        /// <summary>
        /// Gets or sets the CreatedAt
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the CreatedBy
        /// </summary>
        public long CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the UpdatedBy
        /// </summary>
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the UpdatedAt
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Gets or sets the Rol
        /// </summary>
        public virtual Rol? Rol { get; set; }

        /// <summary>
        /// Gets or sets the Operation
        /// </summary>
        public virtual Operation? Operation { get; set; }
    }
}
