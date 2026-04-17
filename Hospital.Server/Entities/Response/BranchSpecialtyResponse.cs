namespace Hospital.Server.Entities.Response
{
    /// <summary>
    /// Response DTO for a Branch-Specialty assignment.
    /// </summary>
    public class BranchSpecialtyResponse
    {
        /// <summary>Gets or sets the Id</summary>
        public long Id { get; set; }

        /// <summary>Gets or sets the BranchId</summary>
        public long BranchId { get; set; }

        /// <summary>Gets or sets the SpecialtyId</summary>
        public long SpecialtyId { get; set; }

        /// <summary>Gets or sets the State</summary>
        public int State { get; set; }

        /// <summary>Gets or sets the CreatedAt</summary>
        public string CreatedAt { get; set; } = string.Empty;

        /// <summary>Gets or sets the CreatedBy</summary>
        public long CreatedBy { get; set; }

        /// <summary>Gets or sets the UpdatedBy</summary>
        public long? UpdatedBy { get; set; }

        /// <summary>Gets or sets the UpdatedAt</summary>
        public string? UpdatedAt { get; set; }

        /// <summary>Gets or sets the Branch navigation</summary>
        public virtual BranchResponse? Branch { get; set; }

        /// <summary>Gets or sets the Specialty navigation</summary>
        public virtual SpecialtyResponse? Specialty { get; set; }
    }
}
