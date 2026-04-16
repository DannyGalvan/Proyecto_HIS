using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    /// <summary>
    /// Defines the <see cref="UserRequest" />
    /// </summary>
    public class UserRequest : IRequest<long?>
    {
        /// <summary>
        /// Gets or sets the Id
        /// </summary>
        public long? Id { get; set; }

        /// <summary>
        /// Gets or sets the RolId
        /// </summary>
        public long? RolId { get; set; }

        /// <summary>
        /// Gets or sets the Password
        /// </summary>
        public string? Password { get; set; }

        /// <summary>
        /// Gets or sets the Email
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Gets or sets the Name
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Gets or sets the IdentificationDocument
        /// </summary>
        public string? IdentificationDocument { get; set; }

        /// <summary>
        /// Gets or sets the UserName
        /// </summary>
        public string? UserName { get; set; }

        /// <summary>
        /// Gets or sets the Number (Phone)
        /// </summary>
        public string? Number { get; set; }

        /// <summary>
        /// Gets or sets the Nit
        /// </summary>
        public string? Nit { get; set; }

        /// <summary>
        /// Gets or sets the BranchId
        /// </summary>
        public long? BranchId { get; set; }

        /// <summary>
        /// Gets or sets the InsuranceNumber
        /// </summary>
        public string? InsuranceNumber { get; set; }

        /// <summary>
        /// Gets or sets the State
        /// </summary>
        public int? State { get; set; }

        /// <summary>
        /// Gets or sets the CreatedBy
        /// </summary>
        public long? CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the UpdatedBy
        /// </summary>
        public long? UpdatedBy { get; set; }
    }
}
