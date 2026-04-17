using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    /// <summary>
    /// Request DTO for creating or updating a Branch-Specialty assignment.
    /// </summary>
    public class BranchSpecialtyRequest : IRequest<long?>
    {
        /// <summary>Gets or sets the Id (null on create)</summary>
        public long? Id { get; set; }

        /// <summary>Gets or sets the BranchId</summary>
        public long? BranchId { get; set; }

        /// <summary>Gets or sets the SpecialtyId</summary>
        public long? SpecialtyId { get; set; }

        /// <summary>Gets or sets the State (1 = active, 0 = inactive)</summary>
        public int? State { get; set; }

        /// <summary>Gets or sets the CreatedBy</summary>
        public long? CreatedBy { get; set; }

        /// <summary>Gets or sets the UpdatedBy</summary>
        public long? UpdatedBy { get; set; }
    }
}
