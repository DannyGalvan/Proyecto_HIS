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
        PaymentConfirmation = 3
    }
}
