using System.Net;
using System.Net.Mail;
using Hospital.Server.Configs.Models;
using Hospital.Server.Services.Interfaces;
using Lombok.NET;
using Microsoft.Extensions.Options;

namespace Hospital.Server.Services.Core
{
    /// <summary>
    /// Defines the <see cref="SendEmail" />
    /// </summary>
    [AllArgsConstructor]
    public partial class SendEmail : ISendMail
    {
        /// <summary>
        /// Defines the _appSettings
        /// </summary>
        private readonly IOptions<AppSettings> _appSettings;

        /// <summary>
        /// Defines the _logger
        /// </summary>
        private readonly ILogger<SendEmail> _logger;

        /// <summary>
        /// The Send
        /// </summary>
        /// <param name="correo">The correo<see cref="string"/></param>
        /// <param name="asunto">The asunto<see cref="string"/></param>
        /// <param name="mensaje">The mensaje<see cref="string"/></param>
        /// <returns>The <see cref="bool"/></returns>
        public bool Send(string correo, string asunto, string mensaje)
        {
            bool resultado;
            var appSettings = _appSettings.Value;
            try
            {
                MailMessage mail = new();
                mail.To.Add(correo);
                mail.From = new MailAddress(appSettings.Email);
                mail.Subject = asunto;
                mail.Body = mensaje;
                mail.IsBodyHtml = true;

                var smtp = new SmtpClient()
                {
                    Credentials = new NetworkCredential(appSettings.Email, appSettings.Password),
                    Host = appSettings.Host,
                    Port = appSettings.Port,
                    EnableSsl = true,
                };

                smtp.Send(mail);
                resultado = true;

            }
            catch (Exception ex)
            {
                resultado = false;

                _logger.LogError(ex, "Error al enviar el correo");
            }

            return resultado;
        }

        /// <summary>
        /// Defines the _emailTemplateService
        /// </summary>
        private readonly EmailTemplateService _emailTemplateService;

        /// <summary>
        /// Sends an email using a predefined HTML template with dynamic data replacement.
        /// Uses <see cref="EmailTemplateService"/> to generate the HTML body from the
        /// specified template type and data, then sends it via the existing SMTP logic.
        /// </summary>
        /// <param name="correo">The recipient email address.</param>
        /// <param name="asunto">The email subject.</param>
        /// <param name="templateType">The type of email template to use.</param>
        /// <param name="data">Dictionary of placeholder keys and their replacement values.</param>
        /// <returns><c>true</c> if the email was sent successfully; otherwise, <c>false</c>.</returns>
        public bool SendWithTemplate(string correo, string asunto, EmailTemplateType templateType, Dictionary<string, string> data)
        {
            try
            {
                string htmlBody = _emailTemplateService.GenerateHtml(templateType, data);
                return Send(correo, asunto, htmlBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar plantilla de correo para tipo {TemplateType}", templateType);
                return false;
            }
        }
    }
}
