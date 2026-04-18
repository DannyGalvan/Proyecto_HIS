using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.DoctorTaskInterceptors
{
    /// <summary>
    /// When a DoctorTask is created or modified, cancels obsolete pending reminders
    /// by marking existing NotificationLog entries as Status=0 (cancelled).
    /// This allows the background service to schedule new reminders based on updated data.
    /// </summary>
    public class DoctorTaskReminderRecalculationInterceptor
        : IEntityAfterCreateInterceptor<DoctorTask, DoctorTaskRequest>,
          IEntityAfterUpdateInterceptor<DoctorTask, DoctorTaskRequest>,
          IEntityAfterPartialUpdateInterceptor<DoctorTask, DoctorTaskRequest>
    {
        private const int NotificationTypeDailyAgenda = 7;

        private readonly DataContext _db;
        private readonly ILogger<DoctorTaskReminderRecalculationInterceptor> _logger;

        public DoctorTaskReminderRecalculationInterceptor(
            DataContext db,
            ILogger<DoctorTaskReminderRecalculationInterceptor> logger)
        {
            _db = db;
            _logger = logger;
        }

        public Response<DoctorTask, List<ValidationFailure>> Execute(
            Response<DoctorTask, List<ValidationFailure>> response,
            DoctorTaskRequest request)
        {
            if (!response.Success || response.Data == null)
                return response;

            CancelObsoleteReminders(response.Data.Id).GetAwaiter().GetResult();
            return response;
        }

        public Response<DoctorTask, List<ValidationFailure>> Execute(
            Response<DoctorTask, List<ValidationFailure>> response,
            DoctorTaskRequest request,
            DoctorTask prevState)
        {
            if (!response.Success || response.Data == null)
                return response;

            CancelObsoleteReminders(response.Data.Id).GetAwaiter().GetResult();
            return response;
        }

        private async Task CancelObsoleteReminders(long taskId)
        {
            try
            {
                // Cancel any pending notification logs related to this task
                var pendingReminders = await _db.NotificationLogs
                    .Where(n =>
                        n.RelatedEntityType == "DoctorTask" &&
                        n.RelatedEntityId == taskId &&
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
                        "Cancelados {Count} recordatorios obsoletos para DoctorTask {TaskId}",
                        pendingReminders.Count, taskId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelando recordatorios para DoctorTask {TaskId}", taskId);
            }
        }
    }
}
