using Hospital.Server.Context;
using Hospital.Server.Services.Core;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Services.Background
{
    /// <summary>
    /// Background service that handles two jobs:
    ///
    /// Job A — runs every 5 minutes:
    ///   Cancels "Pendiente de Pago" appointments older than 10 minutes whose
    ///   creation timestamp has passed the payment window. This covers patients
    ///   who abandoned the booking flow without paying.
    ///
    /// Job B — runs once daily at 01:00 AM:
    ///   Cancels all remaining "Pendiente de Pago" appointments whose
    ///   AppointmentDate is in the past. This handles any edge cases missed by Job A.
    /// </summary>
    public class AppointmentExpirationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AppointmentExpirationService> _logger;

        // How long a "Pendiente de Pago" appointment may exist before it is auto-cancelled
        private const int ExpirationMinutes = 10;

        // How often Job A runs
        private static readonly TimeSpan JobAInterval = TimeSpan.FromMinutes(5);

        public AppointmentExpirationService(
            IServiceProvider serviceProvider,
            ILogger<AppointmentExpirationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AppointmentExpirationService iniciado.");

            // Stagger startup by 30 seconds so the application is fully ready
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            DateTime lastDailyRun = DateTime.MinValue;

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // ── Job A: expire recently-created pending appointments ──────────
                    await ExpireAbandonedPaymentsAsync(stoppingToken);

                    // ── Job B: once daily at 01:00 — cancel past-date pending ────────
                    var now = DateTime.UtcNow;
                    if (now.Hour == 1 && (now - lastDailyRun).TotalHours >= 23)
                    {
                        await CancelPastDuePendingAsync(stoppingToken);
                        lastDailyRun = now;
                    }
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Error en AppointmentExpirationService");
                }

                await Task.Delay(JobAInterval, stoppingToken);
            }

            _logger.LogInformation("AppointmentExpirationService detenido.");
        }

        /// <summary>
        /// Job A — Cancel "Pendiente de Pago" appointments created more than
        /// <see cref="ExpirationMinutes"/> ago and whose payment window has expired.
        /// </summary>
        private async Task ExpireAbandonedPaymentsAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DataContext>();

            var cutoff = DateTime.UtcNow.AddMinutes(-ExpirationMinutes);

            var expired = await db.Appointments
                .Where(a =>
                    a.State == 1 &&
                    a.AppointmentStatusId == AppointmentStateMachine.STATUS_PENDIENTE_PAGO &&
                    a.CreatedAt <= cutoff)
                .ToListAsync(ct);

            if (expired.Count == 0) return;

            foreach (var appt in expired)
            {
                appt.AppointmentStatusId = AppointmentStateMachine.STATUS_CANCELADA;
                appt.UpdatedAt = DateTime.UtcNow;
                appt.UpdatedBy = 1; // System user
            }

            await db.SaveChangesAsync(ct);

            _logger.LogInformation(
                "AppointmentExpirationService [Job A]: {Count} cita(s) pendientes de pago expiradas y canceladas.",
                expired.Count);
        }

        /// <summary>
        /// Job B — Cancel any remaining "Pendiente de Pago" appointment whose
        /// scheduled date is already in the past.
        /// </summary>
        private async Task CancelPastDuePendingAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DataContext>();

            var now = DateTime.UtcNow;

            var pastDue = await db.Appointments
                .Where(a =>
                    a.State == 1 &&
                    a.AppointmentStatusId == AppointmentStateMachine.STATUS_PENDIENTE_PAGO &&
                    a.AppointmentDate < now)
                .ToListAsync(ct);

            if (pastDue.Count == 0) return;

            foreach (var appt in pastDue)
            {
                appt.AppointmentStatusId = AppointmentStateMachine.STATUS_CANCELADA;
                appt.UpdatedAt = DateTime.UtcNow;
                appt.UpdatedBy = 1; // System user
            }

            await db.SaveChangesAsync(ct);

            _logger.LogInformation(
                "AppointmentExpirationService [Job B]: {Count} cita(s) pendientes vencidas y canceladas.",
                pastDue.Count);
        }
    }
}
