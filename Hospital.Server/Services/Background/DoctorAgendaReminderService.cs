using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Services.Background
{
    /// <summary>
    /// Background service that sends agenda-related notifications to doctors:
    /// - Daily summary at 06:00 local time (NotificationType=7)
    /// - 1-hour reminder for appointments (NotificationType=8) and events (NotificationType=11)
    /// - 15-minute reminder for appointments (NotificationType=9) and events (NotificationType=12)
    ///
    /// Runs every 5 minutes. Uses NotificationLog to avoid duplicates.
    /// Timezone-aware: converts UTC to each doctor's local time.
    /// </summary>
    public class DoctorAgendaReminderService : BackgroundService
    {
        private const int NotificationTypeDailyAgenda = 7;
        private const int NotificationTypeAppointmentReminder1h = 8;
        private const int NotificationTypeAppointmentReminder15m = 9;
        private const int NotificationTypeNewAppointment = 10;
        private const int NotificationTypeEventReminder1h = 11;
        private const int NotificationTypeEventReminder15m = 12;

        private const string DefaultTimezone = "America/Guatemala";
        private static readonly TimeSpan JobInterval = TimeSpan.FromMinutes(5);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DoctorAgendaReminderService> _logger;

        private static readonly string[] EventTypeNames = { "Reunión", "Descanso", "Capacitación", "Personal", "Otro" };

        public DoctorAgendaReminderService(
            IServiceScopeFactory scopeFactory,
            ILogger<DoctorAgendaReminderService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DoctorAgendaReminderService iniciado.");

            // Wait 90 seconds after startup so the app is fully ready
            await Task.Delay(TimeSpan.FromSeconds(90), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessRemindersAsync(stoppingToken);
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Error en DoctorAgendaReminderService");
                }

                await Task.Delay(JobInterval, stoppingToken);
            }

            _logger.LogInformation("DoctorAgendaReminderService detenido.");
        }

        private async Task ProcessRemindersAsync(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DataContext>();
            var mail = scope.ServiceProvider.GetRequiredService<ISendMail>();

            var utcNow = DateTime.UtcNow;

            // Get all active doctors (users with doctor role, State=1)
            // Doctor role is typically RolId=3 but we check by role name for safety
            var doctors = await db.Users
                .Include(u => u.Timezone)
                .Include(u => u.Rol)
                .Where(u => u.State == 1 && u.Rol != null && u.Rol.Name == "Doctor")
                .ToListAsync(ct);

            foreach (var doctor in doctors)
            {
                try
                {
                    var ianaId = doctor.Timezone?.IanaId ?? DefaultTimezone;
                    TimeZoneInfo tzInfo;
                    try
                    {
                        tzInfo = TimeZoneInfo.FindSystemTimeZoneById(ianaId);
                    }
                    catch
                    {
                        tzInfo = TimeZoneInfo.FindSystemTimeZoneById(DefaultTimezone);
                    }

                    var localNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, tzInfo);

                    // Process daily summary
                    await ProcessDailySummaryAsync(db, mail, doctor, tzInfo, localNow, utcNow, ct);

                    // Process 1-hour reminders
                    await ProcessAppointmentRemindersAsync(db, mail, doctor, tzInfo, utcNow, "1 hora",
                        NotificationTypeAppointmentReminder1h, 55, 65, ct);
                    await ProcessEventRemindersAsync(db, mail, doctor, tzInfo, utcNow, "1 hora",
                        NotificationTypeEventReminder1h, 55, 65, ct);

                    // Process 15-minute reminders
                    await ProcessAppointmentRemindersAsync(db, mail, doctor, tzInfo, utcNow, "15 minutos",
                        NotificationTypeAppointmentReminder15m, 10, 20, ct);
                    await ProcessEventRemindersAsync(db, mail, doctor, tzInfo, utcNow, "15 minutos",
                        NotificationTypeEventReminder15m, 10, 20, ct);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error procesando recordatorios para doctor {DoctorId}", doctor.Id);
                }
            }
        }

        private async Task ProcessDailySummaryAsync(
            DataContext db, ISendMail mail, User doctor,
            TimeZoneInfo tzInfo, DateTime localNow, DateTime utcNow, CancellationToken ct)
        {
            // Check if local time is within the 05:55-06:05 window
            var localTimeOfDay = localNow.TimeOfDay;
            if (localTimeOfDay < TimeSpan.FromMinutes(355) || localTimeOfDay > TimeSpan.FromMinutes(365))
                return;

            // Check if already sent today
            var todayLocalStart = localNow.Date;
            var todayUtcStart = TimeZoneInfo.ConvertTimeToUtc(todayLocalStart, tzInfo);
            var todayUtcEnd = TimeZoneInfo.ConvertTimeToUtc(todayLocalStart.AddDays(1), tzInfo);

            var alreadySent = await db.NotificationLogs
                .AnyAsync(n =>
                    n.RelatedEntityType == "DailyAgenda" &&
                    n.RelatedEntityId == doctor.Id &&
                    n.NotificationType == NotificationTypeDailyAgenda &&
                    n.Status == 1 &&
                    n.CreatedAt >= todayUtcStart &&
                    n.CreatedAt < todayUtcEnd, ct);

            if (alreadySent) return;

            // Get today's appointments for this doctor
            var appointments = await db.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Specialty)
                .Where(a =>
                    a.DoctorId == doctor.Id &&
                    a.State == 1 &&
                    a.AppointmentDate >= todayUtcStart &&
                    a.AppointmentDate < todayUtcEnd)
                .OrderBy(a => a.AppointmentDate)
                .ToListAsync(ct);

            // Get today's events for this doctor
            var events = await db.DoctorEvents
                .Where(e =>
                    e.DoctorId == doctor.Id &&
                    e.State == 1 &&
                    e.StartDate < todayUtcEnd &&
                    e.EndDate >= todayUtcStart)
                .OrderBy(e => e.StartDate)
                .ToListAsync(ct);

            // Get today's tasks for this doctor
            var tasks = await db.DoctorTasks
                .Where(t =>
                    t.DoctorId == doctor.Id &&
                    t.State == 1 &&
                    t.IsCompleted == false &&
                    t.DueDate >= todayUtcStart &&
                    t.DueDate < todayUtcEnd)
                .OrderBy(t => t.DueDate)
                .ToListAsync(ct);

            // Skip if no activities
            if (appointments.Count == 0 && events.Count == 0 && tasks.Count == 0)
                return;

            // Build tables
            var tablaCitas = BuildAppointmentsTable(appointments, tzInfo);
            var tablaEventos = BuildEventsTable(events, tzInfo);
            var tablaTareas = BuildTasksTable(tasks, tzInfo);

            var data = new Dictionary<string, string>
            {
                { "NombreDoctor", doctor.Name },
                { "Fecha", localNow.ToString("dddd, dd 'de' MMMM 'de' yyyy") },
                { "TablaCitas", tablaCitas },
                { "TablaEventos", tablaEventos },
                { "TablaTareas", tablaTareas }
            };

            var subject = $"Resumen de Agenda — {localNow:dd/MM/yyyy}";

            await SendNotificationAsync(db, mail, doctor.Email, subject,
                EmailTemplateType.DailyAgendaSummary, data,
                "DailyAgenda", doctor.Id, NotificationTypeDailyAgenda, utcNow);
        }

        private async Task ProcessAppointmentRemindersAsync(
            DataContext db, ISendMail mail, User doctor,
            TimeZoneInfo tzInfo, DateTime utcNow, string timeLabel,
            int notificationType, int minMinutes, int maxMinutes, CancellationToken ct)
        {
            var windowStart = utcNow.AddMinutes(minMinutes);
            var windowEnd = utcNow.AddMinutes(maxMinutes);

            var appointments = await db.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Specialty)
                .Include(a => a.Branch)
                .Where(a =>
                    a.DoctorId == doctor.Id &&
                    a.State == 1 &&
                    a.AppointmentDate >= windowStart &&
                    a.AppointmentDate <= windowEnd)
                .ToListAsync(ct);

            if (appointments.Count == 0) return;

            var appointmentIds = appointments.Select(a => a.Id).ToList();

            var alreadySent = await db.NotificationLogs
                .Where(n =>
                    n.RelatedEntityType == "Appointment" &&
                    appointmentIds.Contains(n.RelatedEntityId) &&
                    n.NotificationType == notificationType &&
                    n.Status == 1)
                .Select(n => n.RelatedEntityId)
                .ToListAsync(ct);

            var alreadySentSet = new HashSet<long>(alreadySent);

            foreach (var appt in appointments)
            {
                if (alreadySentSet.Contains(appt.Id)) continue;

                var localTime = TimeZoneInfo.ConvertTimeFromUtc(appt.AppointmentDate, tzInfo);

                var data = new Dictionary<string, string>
                {
                    { "NombreDoctor", doctor.Name },
                    { "TiempoRestante", timeLabel },
                    { "NombrePaciente", appt.Patient?.Name ?? "Paciente" },
                    { "Especialidad", appt.Specialty?.Name ?? "—" },
                    { "HoraCita", localTime.ToString("HH:mm") },
                    { "Sucursal", appt.Branch?.Name ?? "—" }
                };

                var subject = $"Recordatorio: Cita en {timeLabel} — {appt.Patient?.Name ?? "Paciente"}";

                await SendNotificationAsync(db, mail, doctor.Email, subject,
                    EmailTemplateType.AppointmentReminder, data,
                    "Appointment", appt.Id, notificationType, utcNow);
            }
        }

        private async Task ProcessEventRemindersAsync(
            DataContext db, ISendMail mail, User doctor,
            TimeZoneInfo tzInfo, DateTime utcNow, string timeLabel,
            int notificationType, int minMinutes, int maxMinutes, CancellationToken ct)
        {
            var windowStart = utcNow.AddMinutes(minMinutes);
            var windowEnd = utcNow.AddMinutes(maxMinutes);

            var events = await db.DoctorEvents
                .Where(e =>
                    e.DoctorId == doctor.Id &&
                    e.State == 1 &&
                    e.StartDate >= windowStart &&
                    e.StartDate <= windowEnd)
                .ToListAsync(ct);

            if (events.Count == 0) return;

            var eventIds = events.Select(e => e.Id).ToList();

            var alreadySent = await db.NotificationLogs
                .Where(n =>
                    n.RelatedEntityType == "DoctorEvent" &&
                    eventIds.Contains(n.RelatedEntityId) &&
                    n.NotificationType == notificationType &&
                    n.Status == 1)
                .Select(n => n.RelatedEntityId)
                .ToListAsync(ct);

            var alreadySentSet = new HashSet<long>(alreadySent);

            foreach (var evt in events)
            {
                if (alreadySentSet.Contains(evt.Id)) continue;

                var localStart = TimeZoneInfo.ConvertTimeFromUtc(evt.StartDate, tzInfo);
                var localEnd = TimeZoneInfo.ConvertTimeFromUtc(evt.EndDate, tzInfo);
                var eventTypeName = evt.EventType >= 0 && evt.EventType < EventTypeNames.Length
                    ? EventTypeNames[evt.EventType]
                    : "Otro";

                var data = new Dictionary<string, string>
                {
                    { "NombreDoctor", doctor.Name },
                    { "TiempoRestante", timeLabel },
                    { "TituloEvento", evt.Title },
                    { "TipoEvento", eventTypeName },
                    { "HoraInicio", localStart.ToString("HH:mm") },
                    { "HoraFin", localEnd.ToString("HH:mm") }
                };

                var subject = $"Recordatorio: Evento en {timeLabel} — {evt.Title}";

                await SendNotificationAsync(db, mail, doctor.Email, subject,
                    EmailTemplateType.EventReminder, data,
                    "DoctorEvent", evt.Id, notificationType, utcNow);
            }
        }

        private async Task SendNotificationAsync(
            DataContext db, ISendMail mail, string recipientEmail, string subject,
            EmailTemplateType templateType, Dictionary<string, string> data,
            string relatedEntityType, long relatedEntityId, int notificationType, DateTime utcNow)
        {
            if (string.IsNullOrWhiteSpace(recipientEmail)) return;

            bool emailSent;
            string? errorMsg = null;

            try
            {
                emailSent = mail.SendWithTemplate(recipientEmail, subject, templateType, data);
                if (!emailSent) errorMsg = "El servicio de correo retornó false";
            }
            catch (Exception ex)
            {
                emailSent = false;
                errorMsg = ex.Message;
            }

            db.NotificationLogs.Add(new NotificationLog
            {
                RecipientEmail = recipientEmail,
                Subject = subject,
                NotificationType = notificationType,
                RelatedEntityType = relatedEntityType,
                RelatedEntityId = relatedEntityId,
                SentAt = emailSent ? utcNow : null,
                Status = emailSent ? 1 : 2, // 1=Sent, 2=Failed
                RetryCount = 0,
                ErrorMessage = errorMsg,
                State = 1,
                CreatedAt = utcNow,
                CreatedBy = 1 // System user
            });

            await db.SaveChangesAsync();
        }

        private string BuildAppointmentsTable(List<Appointment> appointments, TimeZoneInfo tzInfo)
        {
            if (appointments.Count == 0)
                return "<p style=\"color:#6b7280;font-style:italic;\">No hay citas programadas para hoy.</p>";

            var rows = string.Join("", appointments.Select(a =>
            {
                var localTime = TimeZoneInfo.ConvertTimeFromUtc(a.AppointmentDate, tzInfo);
                return $@"<tr>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{localTime:HH:mm}</td>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{a.Patient?.Name ?? "—"}</td>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{a.Specialty?.Name ?? "—"}</td>
                </tr>";
            }));

            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"" style=""border:1px solid #e5e7eb;border-radius:4px;"">
                <tr style=""background-color:#f9fafb;"">
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Hora</th>
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Paciente</th>
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Especialidad</th>
                </tr>
                {rows}
            </table>";
        }

        private string BuildEventsTable(List<DoctorEvent> events, TimeZoneInfo tzInfo)
        {
            if (events.Count == 0)
                return "<p style=\"color:#6b7280;font-style:italic;\">No hay eventos programados para hoy.</p>";

            var rows = string.Join("", events.Select(e =>
            {
                var localStart = TimeZoneInfo.ConvertTimeFromUtc(e.StartDate, tzInfo);
                var localEnd = TimeZoneInfo.ConvertTimeFromUtc(e.EndDate, tzInfo);
                var typeName = e.EventType >= 0 && e.EventType < EventTypeNames.Length
                    ? EventTypeNames[e.EventType]
                    : "Otro";
                return $@"<tr>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{localStart:HH:mm} - {localEnd:HH:mm}</td>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{e.Title}</td>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{typeName}</td>
                </tr>";
            }));

            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"" style=""border:1px solid #e5e7eb;border-radius:4px;"">
                <tr style=""background-color:#f9fafb;"">
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Horario</th>
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Título</th>
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Tipo</th>
                </tr>
                {rows}
            </table>";
        }

        private string BuildTasksTable(List<DoctorTask> tasks, TimeZoneInfo tzInfo)
        {
            if (tasks.Count == 0)
                return "<p style=\"color:#6b7280;font-style:italic;\">No hay tareas pendientes para hoy.</p>";

            string[] priorityLabels = { "Baja", "Normal", "Alta" };

            var rows = string.Join("", tasks.Select(t =>
            {
                var localDue = TimeZoneInfo.ConvertTimeFromUtc(t.DueDate, tzInfo);
                var priority = t.Priority >= 0 && t.Priority < priorityLabels.Length
                    ? priorityLabels[t.Priority]
                    : "Normal";
                return $@"<tr>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{localDue:HH:mm}</td>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{t.Title}</td>
                    <td style=""padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;"">{priority}</td>
                </tr>";
            }));

            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"" style=""border:1px solid #e5e7eb;border-radius:4px;"">
                <tr style=""background-color:#f9fafb;"">
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Hora</th>
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Tarea</th>
                    <th style=""padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;"">Prioridad</th>
                </tr>
                {rows}
            </table>";
        }
    }
}
