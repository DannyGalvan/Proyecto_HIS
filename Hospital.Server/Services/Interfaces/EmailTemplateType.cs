namespace Hospital.Server.Services.Interfaces
{
    /// <summary>
    /// Defines the types of email templates available in the system.
    /// </summary>
    public enum EmailTemplateType
    {
        /// <summary>
        /// Template for password recovery emails with reset link.
        /// </summary>
        PasswordRecovery = 0,

        /// <summary>
        /// Template for password change confirmation notifications.
        /// </summary>
        PasswordChangeConfirmation = 1,

        /// <summary>
        /// Template for appointment confirmation emails.
        /// </summary>
        AppointmentConfirmation = 2,

        /// <summary>
        /// Template for payment confirmation emails.
        /// </summary>
        PaymentConfirmation = 3,

        /// <summary>
        /// Template for daily agenda summary sent to doctors at 06:00 local time.
        /// </summary>
        DailyAgendaSummary = 4,

        /// <summary>
        /// Template for appointment reminder sent to doctors (1h and 15m before).
        /// </summary>
        AppointmentReminder = 5,

        /// <summary>
        /// Template for event reminder sent to doctors (1h and 15m before).
        /// </summary>
        EventReminder = 6,

        /// <summary>
        /// Template for notifying doctors when a new appointment is created.
        /// </summary>
        NewAppointmentNotification = 7
    }
}
