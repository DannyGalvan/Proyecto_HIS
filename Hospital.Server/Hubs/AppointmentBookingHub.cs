using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Hospital.Server.Entities.Dtos;
using Hospital.Server.Services.Interfaces;

namespace Hospital.Server.Hubs
{
    /// <summary>
    /// SignalR Hub for real-time appointment slot blocking.
    /// Manages slot groups by doctor+date and broadcasts lock/release events
    /// to all connected clients viewing the same schedule.
    /// </summary>
    [Authorize]
    public class AppointmentBookingHub : Hub
    {
        private readonly ISlotLockService _slotLockService;

        public AppointmentBookingHub(ISlotLockService slotLockService)
        {
            _slotLockService = slotLockService;
        }

        /// <summary>
        /// Adds the caller to the SignalR group for a specific doctor+date
        /// and sends the current active locks so the client can render them.
        /// </summary>
        public async Task JoinSlotGroup(long doctorId, string date)
        {
            var groupName = $"doctor_{doctorId}_date_{date}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            // Send current active locks to the joining client
            var parsedDate = DateOnly.ParseExact(date, "yyyy-MM-dd");
            var activeLocks = _slotLockService.GetActiveLocksForGroup(doctorId, parsedDate);
            await Clients.Caller.SendAsync("ActiveLocks", activeLocks);
        }

        /// <summary>
        /// Removes the caller from the SignalR group for a specific doctor+date.
        /// </summary>
        public async Task LeaveSlotGroup(long doctorId, string date)
        {
            var groupName = $"doctor_{doctorId}_date_{date}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        /// <summary>
        /// Attempts to lock a slot for the authenticated patient.
        /// On success, broadcasts SlotLocked to the group (and SlotReleased if a previous lock was freed).
        /// On failure, sends SlotLockRejected only to the caller.
        /// </summary>
        public async Task LockSlot(long doctorId, string date, string time)
        {
            var patientId = GetPatientId();
            var parsedDate = DateOnly.ParseExact(date, "yyyy-MM-dd");
            var parsedTime = TimeOnly.ParseExact(time, "HH:mm");

            var result = _slotLockService.TryLockSlot(doctorId, parsedDate, parsedTime, patientId, Context.ConnectionId);

            if (result.Success)
            {
                var groupName = $"doctor_{doctorId}_date_{date}";

                // If a previous lock was released, notify the group
                if (result.ReleasedPrevious != null)
                {
                    await Clients.Group(groupName).SendAsync("SlotReleased", result.ReleasedPrevious);
                }

                // Notify the group about the new lock
                await Clients.Group(groupName).SendAsync("SlotLocked", result.LockInfo);
            }
            else
            {
                // Notify only the caller about the rejection
                await Clients.Caller.SendAsync("SlotLockRejected", new
                {
                    DoctorId = doctorId,
                    Date = date,
                    Time = time,
                    Reason = result.Reason
                });
            }
        }

        /// <summary>
        /// Releases a slot lock for the authenticated patient and notifies the group.
        /// </summary>
        public async Task ReleaseSlot(long doctorId, string date, string time)
        {
            var patientId = GetPatientId();
            var parsedDate = DateOnly.ParseExact(date, "yyyy-MM-dd");
            var parsedTime = TimeOnly.ParseExact(time, "HH:mm");

            var released = _slotLockService.ReleaseSlot(doctorId, parsedDate, parsedTime, patientId);

            if (released)
            {
                var groupName = $"doctor_{doctorId}_date_{date}";
                var slotInfo = new SlotLockInfo(doctorId, date, time, DateTime.MinValue);
                await Clients.Group(groupName).SendAsync("SlotReleased", slotInfo);
            }
        }

        /// <summary>
        /// Releases all locks held by the disconnecting connection and notifies
        /// each affected group about the released slots.
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var releasedLocks = _slotLockService.ReleaseAllByConnection(Context.ConnectionId);

            foreach (var lockInfo in releasedLocks)
            {
                var groupName = $"doctor_{lockInfo.DoctorId}_date_{lockInfo.Date}";
                await Clients.Group(groupName).SendAsync("SlotReleased", lockInfo);
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Extracts the patient (user) ID from the JWT claims.
        /// Uses ClaimTypes.NameIdentifier, matching the convention in CommonController.GetUserId().
        /// </summary>
        private long GetPatientId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null || !long.TryParse(claim.Value, out var patientId))
            {
                throw new HubException("No se pudo identificar al paciente desde el token JWT.");
            }

            return patientId;
        }
    }
}
