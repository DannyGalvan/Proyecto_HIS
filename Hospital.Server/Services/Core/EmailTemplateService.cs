namespace Hospital.Server.Services.Core
{
    using Hospital.Server.Services.Interfaces;

    /// <summary>
    /// Service responsible for generating professional HTML email templates
    /// with HIS branding. Uses inline CSS and table-based layouts for
    /// compatibility with Gmail, Outlook, and Yahoo.
    /// </summary>
    public class EmailTemplateService
    {
        // HIS brand colors
        private const string PrimaryColor = "#1d4ed8";
        private const string PrimaryDark = "#1e3a5f";
        private const string BackgroundColor = "#f3f4f6";
        private const string TextColor = "#374151";
        private const string TextMuted = "#6b7280";
        private const string WarningColor = "#b45309";
        private const string WarningBg = "#fef3c7";
        private const string SuccessColor = "#15803d";
        private const string SuccessBg = "#dcfce7";
        private const string BorderColor = "#e5e7eb";

        /// <summary>
        /// Generates a complete HTML email from the specified template type,
        /// replacing placeholders in <paramref name="data"/> with their values.
        /// </summary>
        /// <param name="templateType">The type of email template to render.</param>
        /// <param name="data">Key/value pairs for placeholder replacement (e.g. {{NombreUsuario}}).</param>
        /// <returns>A fully-formed HTML string ready to be sent as an email body.</returns>
        public string GenerateHtml(EmailTemplateType templateType, Dictionary<string, string> data)
        {
            string bodyContent = templateType switch
            {
                EmailTemplateType.PasswordRecovery => GetPasswordRecoveryBody(),
                EmailTemplateType.PasswordChangeConfirmation => GetPasswordChangeConfirmationBody(),
                EmailTemplateType.AppointmentConfirmation => GetAppointmentConfirmationBody(),
                EmailTemplateType.PaymentConfirmation => GetPaymentConfirmationBody(),
                _ => GetGenericBody()
            };

            string html = WrapInLayout(bodyContent);

            // Replace all placeholders with actual data
            foreach (var kvp in data)
            {
                html = html.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
            }

            return html;
        }

        /// <summary>
        /// Wraps body content in the full HTML layout with header, body, and footer.
        /// </summary>
        private string WrapInLayout(string bodyContent)
        {
            return $@"<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>HIS - Sistema de Información Hospitalaria</title>
</head>
<body style=""margin:0;padding:0;background-color:{BackgroundColor};font-family:Arial,Helvetica,sans-serif;"">
    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"" style=""background-color:{BackgroundColor};"">
        <tr>
            <td align=""center"" style=""padding:20px 10px;"">
                <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""600"" style=""max-width:600px;width:100%;"">
                    {GetHeader()}
                    <tr>
                        <td style=""background-color:#ffffff;padding:32px 40px;border-left:1px solid {BorderColor};border-right:1px solid {BorderColor};"">
                            {bodyContent}
                        </td>
                    </tr>
                    {GetFooter()}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }

        /// <summary>
        /// Returns the email header with HIS logo/branding.
        /// </summary>
        private string GetHeader()
        {
            return $@"<tr>
    <td style=""background-color:{PrimaryDark};padding:24px 40px;border-radius:8px 8px 0 0;"">
        <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
            <tr>
                <td style=""color:#ffffff;font-size:24px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;"">
                    &#x1F3E5; HIS
                </td>
                <td align=""right"" style=""color:#cbd5e1;font-size:13px;font-family:Arial,Helvetica,sans-serif;"">
                    Sistema de Información Hospitalaria
                </td>
            </tr>
        </table>
    </td>
</tr>";
        }

        /// <summary>
        /// Returns the email footer with contact info and no-reply notice.
        /// </summary>
        private string GetFooter()
        {
            return $@"<tr>
    <td style=""background-color:{PrimaryDark};padding:24px 40px;border-radius:0 0 8px 8px;"">
        <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
            <tr>
                <td style=""color:#cbd5e1;font-size:12px;font-family:Arial,Helvetica,sans-serif;line-height:20px;"">
                    <strong style=""color:#ffffff;"">Hospital — Sistema de Información Hospitalaria</strong><br>
                    Tel: (502) 2222-0000 &nbsp;|&nbsp; Correo: soporte@hospital.gob.gt<br>
                    Dirección: Ciudad de Guatemala, Guatemala
                </td>
            </tr>
            <tr>
                <td style=""padding-top:16px;border-top:1px solid #334155;color:#94a3b8;font-size:11px;font-family:Arial,Helvetica,sans-serif;line-height:18px;"">
                    Este correo fue enviado automáticamente por el sistema HIS. Por favor no responda a este mensaje.<br>
                    Si no solicitó esta acción, puede ignorar este correo de forma segura.
                </td>
            </tr>
        </table>
    </td>
</tr>";
        }

        /// <summary>
        /// Password recovery template body.
        /// Placeholders: {{NombreUsuario}}, {{EnlaceRecuperacion}}
        /// </summary>
        private static string GetPasswordRecoveryBody()
        {
            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
        <td style=""font-family:Arial,Helvetica,sans-serif;font-size:16px;color:{TextColor};line-height:26px;"">
            <h2 style=""margin:0 0 16px 0;font-size:20px;color:{PrimaryDark};"">Recuperación de Contraseña</h2>
            <p style=""margin:0 0 16px 0;"">Hola <strong>{{{{NombreUsuario}}}}</strong>,</p>
            <p style=""margin:0 0 16px 0;"">Hemos recibido una solicitud para restablecer la contraseña de su cuenta en el Sistema de Información Hospitalaria (HIS).</p>
            <p style=""margin:0 0 24px 0;"">Utilice el siguiente enlace para crear una nueva contraseña:</p>
        </td>
    </tr>
    <tr>
        <td align=""center"" style=""padding:0 0 24px 0;"">
            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"">
                <tr>
                    <td style=""background-color:{PrimaryColor};border-radius:6px;padding:14px 32px;"">
                        <a href=""{{{{EnlaceRecuperacion}}}}"" style=""color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;display:inline-block;"">Restablecer Contraseña</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style=""background-color:{WarningBg};border-left:4px solid {WarningColor};padding:16px;border-radius:0 4px 4px 0;"">
            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{WarningColor};line-height:22px;"">
                        <strong>&#9888;&#65039; Importante:</strong><br>
                        Este enlace es válido por <strong>15 minutos</strong>. Después de ese tiempo, deberá solicitar uno nuevo.<br>
                        Si usted no solicitó este cambio, ignore este correo. Su contraseña permanecerá sin cambios.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style=""padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{TextMuted};line-height:20px;"">
            Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br>
            <span style=""color:{PrimaryColor};word-break:break-all;"">{{{{EnlaceRecuperacion}}}}</span>
        </td>
    </tr>
</table>";
        }

        /// <summary>
        /// Password change confirmation template body.
        /// Placeholders: {{NombreUsuario}}, {{FechaHora}}
        /// </summary>
        private static string GetPasswordChangeConfirmationBody()
        {
            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
        <td style=""font-family:Arial,Helvetica,sans-serif;font-size:16px;color:{TextColor};line-height:26px;"">
            <h2 style=""margin:0 0 16px 0;font-size:20px;color:{PrimaryDark};"">Contraseña Actualizada</h2>
            <p style=""margin:0 0 16px 0;"">Hola <strong>{{{{NombreUsuario}}}}</strong>,</p>
            <p style=""margin:0 0 16px 0;"">Le informamos que la contraseña de su cuenta en el Sistema de Información Hospitalaria (HIS) ha sido cambiada exitosamente.</p>
        </td>
    </tr>
    <tr>
        <td style=""background-color:{SuccessBg};border-left:4px solid {SuccessColor};padding:16px;border-radius:0 4px 4px 0;margin-bottom:16px;"">
            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{SuccessColor};line-height:22px;"">
                        <strong>&#9989; Cambio realizado:</strong><br>
                        Fecha y hora: <strong>{{{{FechaHora}}}}</strong>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style=""padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:{TextColor};line-height:26px;"">
            <p style=""margin:0 0 16px 0;"">Si usted realizó este cambio, no necesita hacer nada más.</p>
        </td>
    </tr>
    <tr>
        <td style=""background-color:{WarningBg};border-left:4px solid {WarningColor};padding:16px;border-radius:0 4px 4px 0;"">
            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{WarningColor};line-height:22px;"">
                        <strong>&#9888;&#65039; ¿No realizó este cambio?</strong><br>
                        Si usted no cambió su contraseña, su cuenta podría estar comprometida. Contacte inmediatamente al equipo de soporte:<br>
                        <strong>Tel:</strong> (502) 2222-0000 &nbsp;|&nbsp; <strong>Correo:</strong> soporte@hospital.gob.gt
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>";
        }

        /// <summary>
        /// Appointment confirmation template body.
        /// Placeholders: {{NombreUsuario}}, {{FechaCita}}, {{HoraCita}}, {{Especialidad}}, {{Medico}}, {{Sucursal}}
        /// </summary>
        private static string GetAppointmentConfirmationBody()
        {
            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
        <td style=""font-family:Arial,Helvetica,sans-serif;font-size:16px;color:{TextColor};line-height:26px;"">
            <h2 style=""margin:0 0 16px 0;font-size:20px;color:{PrimaryDark};"">Confirmación de Cita</h2>
            <p style=""margin:0 0 16px 0;"">Hola <strong>{{{{NombreUsuario}}}}</strong>,</p>
            <p style=""margin:0 0 24px 0;"">Su cita ha sido confirmada con los siguientes detalles:</p>
        </td>
    </tr>
    <tr>
        <td>
            <table role=""presentation"" cellpadding=""8"" cellspacing=""0"" border=""0"" width=""100%"" style=""border:1px solid {BorderColor};border-radius:4px;"">
                <tr style=""background-color:#f9fafb;"">
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;border-bottom:1px solid {BorderColor};"">Fecha</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;border-bottom:1px solid {BorderColor};"">{{{{FechaCita}}}}</td>
                </tr>
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;border-bottom:1px solid {BorderColor};"">Hora</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;border-bottom:1px solid {BorderColor};"">{{{{HoraCita}}}}</td>
                </tr>
                <tr style=""background-color:#f9fafb;"">
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;border-bottom:1px solid {BorderColor};"">Especialidad</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;border-bottom:1px solid {BorderColor};"">{{{{Especialidad}}}}</td>
                </tr>
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;border-bottom:1px solid {BorderColor};"">Médico</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;border-bottom:1px solid {BorderColor};"">{{{{Medico}}}}</td>
                </tr>
                <tr style=""background-color:#f9fafb;"">
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;"">Sucursal</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;"">{{{{Sucursal}}}}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>";
        }

        /// <summary>
        /// Payment confirmation template body.
        /// Placeholders: {{NombreUsuario}}, {{NumeroOrden}}, {{TipoOrden}}, {{Monto}}, {{MetodoPago}}, {{FechaPago}}
        /// </summary>
        private static string GetPaymentConfirmationBody()
        {
            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
        <td style=""font-family:Arial,Helvetica,sans-serif;font-size:16px;color:{TextColor};line-height:26px;"">
            <h2 style=""margin:0 0 16px 0;font-size:20px;color:{PrimaryDark};"">Confirmación de Pago</h2>
            <p style=""margin:0 0 16px 0;"">Hola <strong>{{{{NombreUsuario}}}}</strong>,</p>
            <p style=""margin:0 0 24px 0;"">Su pago ha sido procesado exitosamente. A continuación los detalles:</p>
        </td>
    </tr>
    <tr>
        <td>
            <table role=""presentation"" cellpadding=""8"" cellspacing=""0"" border=""0"" width=""100%"" style=""border:1px solid {BorderColor};border-radius:4px;"">
                <tr style=""background-color:#f9fafb;"">
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;border-bottom:1px solid {BorderColor};"">Orden</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;border-bottom:1px solid {BorderColor};"">{{{{NumeroOrden}}}} ({{{{TipoOrden}}}})</td>
                </tr>
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;border-bottom:1px solid {BorderColor};"">Monto</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;border-bottom:1px solid {BorderColor};""><strong>Q {{{{Monto}}}}</strong></td>
                </tr>
                <tr style=""background-color:#f9fafb;"">
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;border-bottom:1px solid {BorderColor};"">Método de Pago</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;border-bottom:1px solid {BorderColor};"">{{{{MetodoPago}}}}</td>
                </tr>
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextMuted};font-weight:bold;padding:10px 16px;"">Fecha</td>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{TextColor};padding:10px 16px;"">{{{{FechaPago}}}}</td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style=""padding-top:24px;"">
            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"" style=""background-color:{SuccessBg};border-left:4px solid {SuccessColor};padding:16px;border-radius:0 4px 4px 0;"">
                <tr>
                    <td style=""font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{SuccessColor};line-height:22px;padding:16px;"">
                        &#9989; Pago registrado exitosamente. Conserve este correo como comprobante.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>";
        }

        /// <summary>
        /// Generic fallback template body.
        /// Placeholder: {{Contenido}}
        /// </summary>
        private static string GetGenericBody()
        {
            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
        <td style=""font-family:Arial,Helvetica,sans-serif;font-size:16px;color:{TextColor};line-height:26px;"">
            {{{{Contenido}}}}
        </td>
    </tr>
</table>";
        }
    }
}
