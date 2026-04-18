namespace Hospital.Server.Entities.Response
{
    /// <summary>
    /// Defines the <see cref="TimezoneResponse" />
    /// </summary>
    public class TimezoneResponse
    {
        /// <summary>
        /// Gets or sets the Id
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// Gets or sets the IANA timezone identifier
        /// </summary>
        public string IanaId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the display name
        /// </summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the UTC offset string
        /// </summary>
        public string UtcOffset { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the State
        /// </summary>
        public int State { get; set; }
    }
}
