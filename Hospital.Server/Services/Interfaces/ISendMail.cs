namespace Hospital.Server.Services.Interfaces
{
    /// <summary>
    /// Defines the <see cref="ISendMail" />
    /// </summary>
    public interface ISendMail
    {
        /// <summary>
        /// The Send
        /// </summary>
        /// <param name="correo">The correo<see cref="string"/></param>
        /// <param name="asunto">The asunto<see cref="string"/></param>
        /// <param name="mensaje">The mensaje<see cref="string"/></param>
        /// <returns>The <see cref="bool"/></returns>
        public bool Send(string correo, string asunto, string mensaje);

        /// <summary>
        /// Sends an email using a predefined HTML template with dynamic data replacement.
        /// </summary>
        /// <param name="correo">The recipient email address.</param>
        /// <param name="asunto">The email subject.</param>
        /// <param name="templateType">The type of email template to use.</param>
        /// <param name="data">Dictionary of placeholder keys and their replacement values.</param>
        /// <returns><c>true</c> if the email was sent successfully; otherwise, <c>false</c>.</returns>
        public bool SendWithTemplate(string correo, string asunto, EmailTemplateType templateType, Dictionary<string, string> data);
    }
}
