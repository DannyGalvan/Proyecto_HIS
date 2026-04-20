using Hospital.Server.Entities.Dtos;

namespace Hospital.Server.Services.Interfaces
{
    /// <summary>
    /// Defines the <see cref="ISlotLockService" />
    /// Manages temporary slot locks for real-time appointment blocking via SignalR.
    /// </summary>
    public interface ISlotLockService
    {
        /// <summary>
        /// Attempts to lock a slot for a patient. Automatically releases
        /// any previous lock by the same patient for the same doctor+date.
        /// </summary>
        SlotLockResult TryLockSlot(long doctorId, DateOnly date, TimeOnly time,
                                    long patientId, string connectionId);

        /// <summary>
        /// Releases a specific slot lock only if it belongs to the indicated patient.
        /// </summary>
        bool ReleaseSlot(long doctorId, DateOnly date, TimeOnly time, long patientId);

        /// <summary>
        /// Releases all locks associated with a connectionId (disconnection cleanup).
        /// </summary>
        List<SlotLockInfo> ReleaseAllByConnection(string connectionId);

        /// <summary>
        /// Cleans all expired locks and returns the list of removed entries.
        /// </summary>
        List<SlotLockInfo> CleanExpiredLocks();

        /// <summary>
        /// Verifies whether a patient owns the active (non-expired) lock for a slot.
        /// </summary>
        bool VerifyLockOwnership(long doctorId, DateOnly date, TimeOnly time, long patientId);

        /// <summary>
        /// Gets all active (non-expired) locks for a doctor+date group.
        /// </summary>
        List<SlotLockInfo> GetActiveLocksForGroup(long doctorId, DateOnly date);
    }
}
