using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.DoctorEventInterceptors
{
    /// <summary>
    /// When a DoctorEvent is created or modified, cancels obsolete pending reminders
    /// by marking existing NotificationLog entries as Status=0 (cancelled).
    /// This allows the background service to schedule new reminders based on updated data.
    /// </summary>
    public class DoctorEventReminderRecalculationInterceptor
        : IEntityAfterCreateInterceptor<DoctorEvent, DoctorEventRequest>,
          IEntityAfterUpdateInterceptor<DoctorEvent, DoctorEventRequest>,
          IEntityAfterPartialUpdateInterceptor<DoctorEvent, DoctorEventRequest>
    {
        private const int NotificationTypeEventReminder1h = 11;
        private const int NotificationTypeEventReminder15m = 12;

        private readonly DataContext _db;
        private readonly ILogger<DoctorEventReminderRecalculationInterceptor> _logger;

        public DoctorEventReminderRecalculationInterceptor(
            DataContext db,
            ILogger<DoctorEventReminderRecalculationInterceptor> logger)
        {
            _db = db;
            _logger = logger;
        }

        public Response<DoctorEvent, List<ValidationFailure>> Execute(
            Response<DoctorEvent, List<ValidationFailure>> response,
            DoctorEventRequest request)
        {
            if (!response.Success || response.Data == null)
                return response;

            CancelObsoleteReminders(response.Data.Id).GetAwaiter().GetResult();
            return response;
        }

        public Response<DoctorEvent, List<ValidationFailure>> Execute(
            Response<DoctorEvent, List<ValidationFailure>> response,
            DoctorEventRequest request,
            DoctorEvent prevState)
        {
            if (!response.Success || response.Data == null)
                return response;

            CancelObsoleteReminders(response.Data.Id).GetAwaiter().GetResult();
            return response;
        }

        private async Task CancelObsoleteReminders(long eventId)
        {
            try
            {
                var pendingReminders = await _db.NotificationLogs
                    .Where(n =>
                        n.RelatedEntityType == "DoctorEvent" &&
                        n.RelatedEntityId == eventId &&
                        (n.NotificationType == NotificationTypeEventReminder1h ||
                         n.NotificationType == NotificationTypeEventReminder15m) &&
                        n.Status == 1 &&
                        n.State == 1)
                    .ToListAsync();

                foreach (var reminder in pendingReminders)
                {
                    reminder.Status = 0; // Cancelled
                    reminder.UpdatedAt = DateTime.UtcNow;
                    reminder.UpdatedBy = 1; // System
                }

                if (pendingReminders.Count > 0)
                {
                    await _db.SaveChangesAsync();
                    _logger.LogInformation(
                        "Cancelados {Count} recordatorios obsoletos para DoctorEvent {EventId}",
                        pendingReminders.Count, eventId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelando recordatorios para DoctorEvent {EventId}", eventId);
            }
        }
    }
}
