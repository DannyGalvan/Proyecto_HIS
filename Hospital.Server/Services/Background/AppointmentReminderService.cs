using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Services.Background
{
    /// <summary>
    /// Background service that sends appointment reminder emails to patients
    /// whose appointments are in "Confirmada" state (paid, not yet in the
    /// clinical flow).
    ///
    /// Two reminders per appointment:
    ///   - 24 hours before  (NotificationType = 5)
    ///   - 4 hours before   (NotificationType = 6)
    ///
    /// Each reminder is sent at most once, tracked via NotificationLog.
    /// The job runs every 30 minutes.
    ///
    /// Timezone-aware: converts UTC dates to each patient's configured timezone
    /// (falls back to America/Guatemala).
    /// </summary>
    public class AppointmentReminderService : BackgroundService
    {
        private const int NotificationTypeReminder24h = 5;
        private const int NotificationTypeReminder4h  = 6;

        private static readonly TimeSpan JobInterval = TimeSpan.FromMinutes(30);

        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AppointmentReminderService> _logger;

        public AppointmentReminderService(
            IServiceProvider serviceProvider,
            ILogger<AppointmentReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AppointmentReminderService iniciado.");

            // Wait 60 seconds after startup so the app is fully ready
            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SendRemindersAsync(stoppingToken);
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Error en AppointmentReminderService");
                }

                await Task.Delay(JobInterval, stoppingToken);
            }

            _logger.LogInformation("AppointmentReminderService detenido.");
        }

        private async Task SendRemindersAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var db   = scope.ServiceProvider.GetRequiredService<DataContext>();
            var mail = scope.ServiceProvider.GetRequiredService<ISendMail>();

            var now = DateTime.UtcNow;

            // Window: appointments in "Confirmada" state whose date is between
            // now and 25 hours from now. We fetch a wider window and filter per-type.
            var windowEnd = now.AddHours(25);

            var appointments = await db.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.Timezone)
                .Include(a => a.Doctor)
                .Include(a => a.Specialty)
                .Include(a => a.Branch)
                .Where(a =>
                    a.State == 1 &&
                    a.AppointmentStatusId == AppointmentStateMachine.STATUS_CONFIRMADA &&
                    a.AppointmentDate > now &&
                    a.AppointmentDate <= windowEnd)
                .ToListAsync(ct);

            if (appointments.Count == 0) return;

            // Load already-sent reminder logs for these appointments
            var appointmentIds = appointments.Select(a => a.Id).ToList();

            var sentLogs = await db.NotificationLogs
                .Where(n =>
                    n.RelatedEntityType == "Appointment" &&
                    appointmentIds.Contains(n.RelatedEntityId) &&
                    (n.NotificationType == NotificationTypeReminder24h ||
                     n.NotificationType == NotificationTypeReminder4h) &&
                    n.Status == 1) // Status 1 = Sent
                .Select(n => new { n.RelatedEntityId, n.NotificationType })
                .ToListAsync(ct);

            var sentSet = new HashSet<(long appointmentId, int type)>(
                sentLogs.Select(x => (x.RelatedEntityId, x.NotificationType)));

            int sent24h = 0;
            int sent4h  = 0;

            foreach (var appt in appointments)
            {
                var hoursUntil = (appt.AppointmentDate - now).TotalHours;

                // ── 24-hour reminder (send when 20-25 hours remain) ─────────────
                if (hoursUntil <= 25 && hoursUntil > 20 &&
                    !sentSet.Contains((appt.Id, NotificationTypeReminder24h)))
                {
                    var (success, error) = await SendReminderEmailAsync(
                        mail, appt, "un día", NotificationTypeReminder24h, db);

                    if (success) sent24h++;
                    else _logger.LogWarning("No se pudo enviar recordatorio 24h para cita #{Id}: {Err}", appt.Id, error);
                }

                // ── 4-hour reminder (send when 3-5 hours remain) ────────────────
                if (hoursUntil <= 5 && hoursUntil > 3 &&
                    !sentSet.Contains((appt.Id, NotificationTypeReminder4h)))
                {
                    var (success, error) = await SendReminderEmailAsync(
                        mail, appt, "4 horas", NotificationTypeReminder4h, db);

                    if (success) sent4h++;
                    else _logger.LogWarning("No se pudo enviar recordatorio 4h para cita #{Id}: {Err}", appt.Id, error);
                }
            }

            if (sent24h > 0 || sent4h > 0)
            {
                _logger.LogInformation(
                    "AppointmentReminderService: {N24}h 24h / {N4}h 4h enviados.",
                    sent24h, sent4h);
            }
        }

        private async Task<(bool Success, string? Error)> SendReminderEmailAsync(
            ISendMail mail,
            Appointment appt,
            string timeLabel,
            int notificationType,
            DataContext db)
        {
            var patientEmail = appt.Patient?.Email ?? string.Empty;
            var patientName  = appt.Patient?.Name  ?? "Paciente";

            if (string.IsNullOrWhiteSpace(patientEmail))
                return (false, "Paciente sin correo electrónico");

            // Use the patient's configured timezone, falling back to America/Guatemala
            var patientIanaId = appt.Patient?.Timezone?.IanaId;

            var subject = $"Recordatorio: Su cita es en {timeLabel} — Hospital HIS";

            var body = EmailTemplates.AppointmentReminder(
                patientName:     patientName,
                timeLabel:       timeLabel,
                specialtyName:   appt.Specialty?.Name ?? "—",
                doctorName:      appt.Doctor?.Name ?? "Por asignar",
                branchName:      appt.Branch?.Name ?? "—",
                appointmentDate: TimeZoneHelper.FormatForEmail(appt.AppointmentDate, patientIanaId),
                appointmentId:   appt.Id);

            bool emailSent;
            string? errorMsg = null;

            try
            {
                emailSent = mail.Send(patientEmail, subject, body);
                if (!emailSent) errorMsg = "El servicio de correo retornó false";
            }
            catch (Exception ex)
            {
                emailSent = false;
                errorMsg = ex.Message;
            }

            // Record the notification in the log (whether sent or failed)
            db.NotificationLogs.Add(new NotificationLog
            {
                RecipientEmail    = patientEmail,
                Subject           = subject,
                NotificationType  = notificationType,
                RelatedEntityType = "Appointment",
                RelatedEntityId   = appt.Id,
                SentAt            = emailSent ? DateTime.UtcNow : null,
                Status            = emailSent ? 1 : 2, // 1=Sent, 2=Failed
                RetryCount        = 0,
                ErrorMessage      = errorMsg,
                State             = 1,
                CreatedAt         = DateTime.UtcNow,
                CreatedBy         = 1 // System user
            });

            await db.SaveChangesAsync();

            return (emailSent, errorMsg);
        }
    }
}
