using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    /// <summary>
    /// Defines the <see cref="TimezoneRequest" />
    /// </summary>
    public class TimezoneRequest : IRequest<long?>
    {
        /// <summary>
        /// Gets or sets the Id
        /// </summary>
        public long? Id { get; set; }

        /// <summary>
        /// Gets or sets the IANA timezone identifier
        /// </summary>
        public string? IanaId { get; set; }

        /// <summary>
        /// Gets or sets the display name
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// Gets or sets the UTC offset string
        /// </summary>
        public string? UtcOffset { get; set; }

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
