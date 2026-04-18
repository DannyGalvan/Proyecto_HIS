namespace Hospital.Server.Utils
{
    /// <summary>
    /// Provides centralized timezone conversion utilities.
    /// Uses the user's configured IANA timezone, falling back to "America/Guatemala".
    /// </summary>
    public static class TimeZoneHelper
    {
        /// <summary>
        /// Default IANA timezone used when a user has no timezone configured.
        /// </summary>
        public const string DefaultTimezone = "America/Guatemala";

        /// <summary>
        /// Resolves a <see cref="TimeZoneInfo"/> from an IANA timezone identifier.
        /// Falls back to <see cref="DefaultTimezone"/> if the identifier is null, empty,
        /// or cannot be found on the current system.
        /// </summary>
        /// <param name="ianaId">The IANA timezone identifier (e.g., "America/Guatemala").</param>
        /// <returns>A valid <see cref="TimeZoneInfo"/> instance.</returns>
        public static TimeZoneInfo Resolve(string? ianaId)
        {
            if (!string.IsNullOrWhiteSpace(ianaId))
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById(ianaId);
                }
                catch
                {
                    // Identifier not found on this OS — fall through to default
                }
            }

            return TimeZoneInfo.FindSystemTimeZoneById(DefaultTimezone);
        }

        /// <summary>
        /// Converts a UTC <see cref="DateTime"/> to the user's local time using the
        /// provided IANA timezone identifier, then formats it for display in emails.
        /// Format: "lunes, 14 de julio de 2025 — 09:30 hrs"
        /// </summary>
        /// <param name="utcDate">The date/time in UTC.</param>
        /// <param name="ianaId">The user's IANA timezone identifier (nullable).</param>
        /// <returns>A formatted date string in the user's local time.</returns>
        public static string FormatForEmail(DateTime utcDate, string? ianaId)
        {
            var tzInfo = Resolve(ianaId);
            var localDate = TimeZoneInfo.ConvertTimeFromUtc(utcDate, tzInfo);
            return localDate.ToString("dddd, dd 'de' MMMM 'de' yyyy — HH:mm 'hrs'");
        }

        /// <summary>
        /// Converts a UTC <see cref="DateTime"/> to the user's local time.
        /// </summary>
        /// <param name="utcDate">The date/time in UTC.</param>
        /// <param name="ianaId">The user's IANA timezone identifier (nullable).</param>
        /// <returns>The date/time converted to the user's local timezone.</returns>
        public static DateTime ConvertToLocal(DateTime utcDate, string? ianaId)
        {
            var tzInfo = Resolve(ianaId);
            return TimeZoneInfo.ConvertTimeFromUtc(utcDate, tzInfo);
        }
    }
}
