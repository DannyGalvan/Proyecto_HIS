namespace Hospital.Server.Utils
{
    /// <summary>
    /// Provides reusable HTML email templates for Hospital HIS transactional emails.
    /// All templates share a common header/footer and inline CSS for maximum email client compatibility.
    /// </summary>
    public static class EmailTemplates
    {
        // ── Shared constants ────────────────────────────────────────────────────
        private const string PrimaryColor  = "#1d4ed8";
        private const string AccentColor   = "#0ea5e9";
        private const string SuccessColor  = "#16a34a";
        private const string WarningColor  = "#d97706";
        private const string DangerColor   = "#dc2626";
        private const string TextMuted     = "#64748b";
        private const string BorderColor   = "#e2e8f0";
        private const string BgLight       = "#f8fafc";

        // ── Shared layout builders ──────────────────────────────────────────────

        /// <summary>Wraps content in the standard Hospital HIS email shell.</summary>
        private static string Layout(string titleColor, string title, string subtitle, string content)
        {
            return $@"<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <title>{title}</title>
</head>
<body style='margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f1f5f9;padding:32px 16px;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>

          <!-- Header -->
          <tr>
            <td style='background-color:{titleColor};border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;'>
              <p style='margin:0 0 4px;font-size:13px;color:#bfdbfe;letter-spacing:1px;text-transform:uppercase;'>Hospital HIS</p>
              <h1 style='margin:0;color:#ffffff;font-size:22px;font-weight:700;'>{title}</h1>
              {(string.IsNullOrEmpty(subtitle) ? "" : $"<p style='margin:8px 0 0;color:#bfdbfe;font-size:14px;'>{subtitle}</p>")}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style='background-color:#ffffff;padding:32px;border-left:1px solid {BorderColor};border-right:1px solid {BorderColor};'>
              {content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style='background-color:{BgLight};border:1px solid {BorderColor};border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;'>
              <p style='margin:0;font-size:12px;color:#94a3b8;'>
                Hospital HIS — Sistema Informático Hospitalario<br/>
                Este es un mensaje automático, por favor no responda a este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
        }

        /// <summary>Renders a key-value detail row for the appointment summary table.</summary>
        private static string DetailRow(string icon, string label, string value)
            => $@"<tr>
              <td style='padding:8px 12px;color:{TextMuted};font-size:14px;white-space:nowrap;'>{icon} {label}</td>
              <td style='padding:8px 12px;font-size:14px;font-weight:600;color:#1e293b;'>{value}</td>
            </tr>";

        /// <summary>Renders a titled summary card with a table of detail rows.</summary>
        private static string AppointmentCard(
            string specialtyName,
            string doctorName,
            string branchName,
            string appointmentDate,
            long appointmentId,
            string? transactionNumber = null,
            string? amount = null)
        {
            var rows = new System.Text.StringBuilder();
            if (!string.IsNullOrEmpty(transactionNumber))
                rows.Append(DetailRow("🧾", "No. Transacción:", transactionNumber));
            rows.Append(DetailRow("📅", "Fecha y Hora:", appointmentDate));
            rows.Append(DetailRow("🩺", "Especialidad:", specialtyName));
            rows.Append(DetailRow("👨‍⚕️", "Médico:", doctorName));
            rows.Append(DetailRow("📍", "Sede:", branchName));
            rows.Append(DetailRow("🔖", "No. de Cita:", $"#{appointmentId}"));
            if (!string.IsNullOrEmpty(amount))
                rows.Append(DetailRow("💳", "Monto:", amount));

            return $@"<table width='100%' cellpadding='0' cellspacing='0'
                style='background-color:{BgLight};border:1px solid {BorderColor};border-radius:8px;margin:20px 0;'>
              <tr>
                <td style='padding:12px 16px;background-color:{BgLight};border-radius:8px 8px 0 0;border-bottom:1px solid {BorderColor};'>
                  <p style='margin:0;font-size:13px;font-weight:700;color:#475569;letter-spacing:.5px;text-transform:uppercase;'>Detalles de la Cita</p>
                </td>
              </tr>
              <tr>
                <td>
                  <table width='100%' cellpadding='0' cellspacing='0'>
                    {rows}
                  </table>
                </td>
              </tr>
            </table>";
        }

        /// <summary>Renders a highlighted info/warning/success banner strip.</summary>
        private static string Banner(string message, string bgColor, string borderColor, string textColor)
            => $@"<table width='100%' cellpadding='0' cellspacing='0' style='margin:16px 0;'>
              <tr>
                <td style='background-color:{bgColor};border-left:4px solid {borderColor};
                           border-radius:4px;padding:12px 16px;font-size:13px;color:{textColor};'>
                  {message}
                </td>
              </tr>
            </table>";

        // ── Public email builders ───────────────────────────────────────────────

        /// <summary>
        /// Appointment confirmation email sent after successful payment.
        /// </summary>
        public static string AppointmentConfirmation(
            string patientName,
            string specialtyName,
            string doctorName,
            string branchName,
            string appointmentDate,
            long appointmentId,
            string transactionNumber,
            decimal amount)
        {
            var content = $@"
              <p style='font-size:16px;color:#1e293b;margin-top:0;'>
                Estimado/a <strong>{patientName}</strong>,
              </p>
              <p style='font-size:14px;color:{TextMuted};'>
                Su pago fue procesado exitosamente y su cita médica ha sido <strong style='color:{SuccessColor};'>confirmada</strong>.
              </p>

              {Banner("✅ &nbsp;Pago confirmado — su cita está reservada.", "#f0fdf4", SuccessColor, "#166534")}

              {AppointmentCard(specialtyName, doctorName, branchName, appointmentDate, appointmentId, transactionNumber, $"Q{amount:F2}")}

              {Banner("⏰ &nbsp;<strong>Recuerde llegar 15 minutos antes</strong> de su cita para el proceso de recepción y toma de signos vitales.", "#fffbeb", WarningColor, "#92400e")}

              <p style='font-size:13px;color:{TextMuted};margin-bottom:0;'>
                Puede consultar sus citas en cualquier momento desde el portal del paciente.
                Si necesita cancelar, hágalo con anticipación para que el horario quede disponible para otros pacientes.
              </p>";

            return Layout(SuccessColor, "Cita Confirmada", "Su pago fue procesado exitosamente", content);
        }

        /// <summary>
        /// Appointment reminder email sent 24 hours or 4 hours before the appointment.
        /// </summary>
        public static string AppointmentReminder(
            string patientName,
            string timeLabel,
            string specialtyName,
            string doctorName,
            string branchName,
            string appointmentDate,
            long appointmentId)
        {
            var content = $@"
              <p style='font-size:16px;color:#1e293b;margin-top:0;'>
                Estimado/a <strong>{patientName}</strong>,
              </p>
              <p style='font-size:14px;color:{TextMuted};'>
                Le recordamos que tiene una cita médica programada en <strong>{timeLabel}</strong>.
              </p>

              {Banner($"🔔 &nbsp;Su cita es en <strong>{timeLabel}</strong>. ¡No la olvide!", "#eff6ff", PrimaryColor, "#1e40af")}

              {AppointmentCard(specialtyName, doctorName, branchName, appointmentDate, appointmentId)}

              {Banner("⏰ &nbsp;<strong>Recuerde llegar 15 minutos antes</strong> de su cita para el proceso de recepción y toma de signos vitales.", "#fffbeb", WarningColor, "#92400e")}

              <p style='font-size:13px;color:{TextMuted};margin-bottom:0;'>
                Si necesita cancelar o tiene alguna duda, comuníquese con nosotros lo antes posible.
              </p>";

            return Layout(PrimaryColor, "Recordatorio de Cita", $"Su consulta es en {timeLabel}", content);
        }

        /// <summary>
        /// Appointment cancellation email sent when the patient cancels.
        /// </summary>
        public static string AppointmentCancellation(
            string patientName,
            string specialtyName,
            string doctorName,
            string branchName,
            string appointmentDate,
            long appointmentId,
            decimal amount)
        {
            var content = $@"
              <p style='font-size:16px;color:#1e293b;margin-top:0;'>
                Estimado/a <strong>{patientName}</strong>,
              </p>
              <p style='font-size:14px;color:{TextMuted};'>
                Su cita ha sido <strong style='color:{DangerColor};'>cancelada</strong> exitosamente según su solicitud.
              </p>

              {Banner("❌ &nbsp;Cita cancelada. Los fondos serán reintegrados según los términos del servicio.", "#fef2f2", DangerColor, "#991b1b")}

              {AppointmentCard(specialtyName, doctorName, branchName, appointmentDate, appointmentId, null, $"Q{amount:F2}")}

              <p style='font-size:13px;color:{TextMuted};margin-bottom:0;'>
                Si canceló por error o desea agendar una nueva cita, puede hacerlo desde el portal del paciente.<br/>
                Para consultas sobre el reintegro de fondos, comuníquese con nuestro equipo de soporte.
              </p>";

            return Layout(DangerColor, "Cita Cancelada", "Su solicitud de cancelación fue procesada", content);
        }

        /// <summary>
        /// Patient registration welcome email.
        /// </summary>
        public static string PatientWelcome(
            string patientName,
            string userName,
            string email)
        {
            var content = $@"
              <p style='font-size:16px;color:#1e293b;margin-top:0;'>
                Bienvenido/a, <strong>{patientName}</strong> 🎉
              </p>
              <p style='font-size:14px;color:{TextMuted};'>
                Su cuenta en el Portal del Paciente de Hospital HIS ha sido creada exitosamente.
              </p>

              {Banner("✅ &nbsp;Registro completado. Ya puede agendar sus citas en línea.", "#f0fdf4", SuccessColor, "#166534")}

              <table width='100%' cellpadding='0' cellspacing='0'
                style='background-color:{BgLight};border:1px solid {BorderColor};border-radius:8px;margin:20px 0;'>
                <tr><td style='padding:16px;'>
                  <table width='100%' cellpadding='0' cellspacing='0'>
                    {DetailRow("👤", "Nombre:", patientName)}
                    {DetailRow("🔑", "Usuario:", userName)}
                    {DetailRow("📧", "Correo:", email)}
                  </table>
                </td></tr>
              </table>

              {Banner("🔒 &nbsp;Mantenga su contraseña segura y no la comparta con nadie.", "#fffbeb", WarningColor, "#92400e")}

              <p style='font-size:13px;color:{TextMuted};margin-bottom:0;'>
                Puede iniciar sesión en el portal para agendar citas, ver su historial médico y más.
              </p>";

            return Layout(AccentColor, "¡Bienvenido a Hospital HIS!", "Su cuenta fue creada exitosamente", content);
        }
    }
}
