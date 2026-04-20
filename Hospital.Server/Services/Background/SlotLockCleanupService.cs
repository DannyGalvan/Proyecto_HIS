using Microsoft.AspNetCore.SignalR;
using Hospital.Server.Hubs;
using Hospital.Server.Services.Interfaces;

namespace Hospital.Server.Services.Background
{
    /// <summary>
    /// Background service that periodically cleans expired slot locks
    /// and notifies affected SignalR groups about the released slots.
    /// Runs every 30 seconds, following the same pattern as AppointmentExpirationService.
    /// </summary>
    public class SlotLockCleanupService : BackgroundService
    {
        private static readonly TimeSpan CleanupInterval = TimeSpan.FromSeconds(30);
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<AppointmentBookingHub> _hubContext;
        private readonly ILogger<SlotLockCleanupService> _logger;

        public SlotLockCleanupService(
            IServiceProvider serviceProvider,
            IHubContext<AppointmentBookingHub> hubContext,
            ILogger<SlotLockCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SlotLockCleanupService iniciado.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(CleanupInterval, stoppingToken);
                    await CleanExpiredLocksAsync();
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error durante la limpieza de slot locks expirados");
                }
            }

            _logger.LogInformation("SlotLockCleanupService detenido.");
        }

        /// <summary>
        /// Cleans expired locks via ISlotLockService and broadcasts SlotReleased
        /// events to the corresponding SignalR groups.
        /// </summary>
        private async Task CleanExpiredLocksAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var slotLockService = scope.ServiceProvider.GetRequiredService<ISlotLockService>();

            var expiredLocks = slotLockService.CleanExpiredLocks();

            foreach (var lockInfo in expiredLocks)
            {
                var groupName = $"doctor_{lockInfo.DoctorId}_date_{lockInfo.Date}";
                await _hubContext.Clients.Group(groupName).SendAsync("SlotReleased", lockInfo);
            }

            if (expiredLocks.Count > 0)
            {
                _logger.LogInformation(
                    "SlotLockCleanupService: {Count} slot lock(s) expirados limpiados",
                    expiredLocks.Count);
            }
        }
    }
}
