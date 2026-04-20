using System.Collections.Concurrent;
using Hospital.Server.Entities.Dtos;
using Hospital.Server.Services.Interfaces;

namespace Hospital.Server.Services.Core
{
    /// <summary>
    /// Defines the <see cref="SlotLockService" />
    /// Thread-safe in-memory slot lock manager using ConcurrentDictionary.
    /// Registered as Singleton — the static dictionary is shared across all consumers.
    /// </summary>
    public class SlotLockService : ISlotLockService
    {
        /// <summary>
        /// Key format: "doctor_{doctorId}_date_{yyyy-MM-dd}_time_{HH:mm}"
        /// </summary>
        private static readonly ConcurrentDictionary<string, SlotLockEntry> _locks = new();

        /// <summary>
        /// Lock time-to-live in seconds (5 minutes).
        /// </summary>
        private const int LockTtlSeconds = 300;

        /// <inheritdoc/>
        public SlotLockResult TryLockSlot(long doctorId, DateOnly date, TimeOnly time,
                                           long patientId, string connectionId)
        {
            // 1. Release any existing lock by the same connection for the same doctor+date
            SlotLockInfo? releasedPrevious = ReleasePreviousLockForConnection(doctorId, date, connectionId);

            // 2. Build the new lock entry
            var slotKey = GetSlotKey(doctorId, date, time);
            var expiresAt = DateTime.UtcNow.AddSeconds(LockTtlSeconds);
            var newEntry = new SlotLockEntry(doctorId, date, time, patientId, connectionId, expiresAt);

            // 3. Try to add atomically
            if (_locks.TryAdd(slotKey, newEntry))
            {
                var lockInfo = ToSlotLockInfo(newEntry);
                return new SlotLockResult(true, null, lockInfo, releasedPrevious);
            }

            // 4. Slot already exists — check if expired or owned by same connection
            if (_locks.TryGetValue(slotKey, out var existing))
            {
                // If expired, replace it
                if (existing.ExpiresAt < DateTime.UtcNow)
                {
                    if (_locks.TryUpdate(slotKey, newEntry, existing))
                    {
                        var lockInfo = ToSlotLockInfo(newEntry);
                        return new SlotLockResult(true, null, lockInfo, releasedPrevious);
                    }
                }

                // If same connection (same tab), update the lock (re-lock scenario)
                if (existing.ConnectionId == connectionId)
                {
                    if (_locks.TryUpdate(slotKey, newEntry, existing))
                    {
                        var lockInfo = ToSlotLockInfo(newEntry);
                        return new SlotLockResult(true, null, lockInfo, releasedPrevious);
                    }
                }
            }

            // 5. Slot is actively locked by another connection — reject
            return new SlotLockResult(false, "El horario ya está reservado temporalmente por otro paciente");
        }

        /// <inheritdoc/>
        public bool ReleaseSlot(long doctorId, DateOnly date, TimeOnly time, long patientId)
        {
            var slotKey = GetSlotKey(doctorId, date, time);

            if (_locks.TryGetValue(slotKey, out var existing) && existing.PatientId == patientId)
            {
                return _locks.TryRemove(slotKey, out _);
            }

            return false;
        }

        /// <inheritdoc/>
        public List<SlotLockInfo> ReleaseAllByConnection(string connectionId)
        {
            var released = new List<SlotLockInfo>();

            foreach (var kvp in _locks)
            {
                if (kvp.Value.ConnectionId == connectionId)
                {
                    if (_locks.TryRemove(kvp.Key, out var removed))
                    {
                        released.Add(ToSlotLockInfo(removed));
                    }
                }
            }

            return released;
        }

        /// <inheritdoc/>
        public List<SlotLockInfo> CleanExpiredLocks()
        {
            var now = DateTime.UtcNow;
            var expired = new List<SlotLockInfo>();

            foreach (var kvp in _locks)
            {
                if (kvp.Value.ExpiresAt < now)
                {
                    if (_locks.TryRemove(kvp.Key, out var removed))
                    {
                        expired.Add(ToSlotLockInfo(removed));
                    }
                }
            }

            return expired;
        }

        /// <inheritdoc/>
        public bool VerifyLockOwnership(long doctorId, DateOnly date, TimeOnly time, long patientId)
        {
            var slotKey = GetSlotKey(doctorId, date, time);

            return _locks.TryGetValue(slotKey, out var entry)
                && entry.PatientId == patientId
                && entry.ExpiresAt >= DateTime.UtcNow;
        }

        /// <inheritdoc/>
        public List<SlotLockInfo> GetActiveLocksForGroup(long doctorId, DateOnly date)
        {
            var prefix = $"doctor_{doctorId}_date_{date:yyyy-MM-dd}_time_";
            var now = DateTime.UtcNow;
            var activeLocks = new List<SlotLockInfo>();

            foreach (var kvp in _locks)
            {
                if (kvp.Key.StartsWith(prefix) && kvp.Value.ExpiresAt >= now)
                {
                    activeLocks.Add(ToSlotLockInfo(kvp.Value));
                }
            }

            return activeLocks;
        }

        // ── Private helpers ──────────────────────────────────────────────

        private static string GetSlotKey(long doctorId, DateOnly date, TimeOnly time)
            => $"doctor_{doctorId}_date_{date:yyyy-MM-dd}_time_{time:HH:mm}";

        private static SlotLockInfo ToSlotLockInfo(SlotLockEntry entry)
            => new(entry.DoctorId, entry.Date.ToString("yyyy-MM-dd"), entry.Time.ToString("HH:mm"), entry.ExpiresAt);

        /// <summary>
        /// Finds and removes any existing lock by the same connection for the given doctor+date.
        /// Enforces the "max 1 lock per connection per doctor+date" rule.
        /// This ensures that even the same user in two browser tabs gets blocked.
        /// </summary>
        private SlotLockInfo? ReleasePreviousLockForConnection(long doctorId, DateOnly date, string connectionId)
        {
            var prefix = $"doctor_{doctorId}_date_{date:yyyy-MM-dd}_time_";

            foreach (var kvp in _locks)
            {
                if (kvp.Key.StartsWith(prefix)
                    && kvp.Value.ConnectionId == connectionId)
                {
                    if (_locks.TryRemove(kvp.Key, out var removed))
                    {
                        return ToSlotLockInfo(removed);
                    }
                }
            }

            return null;
        }
    }
}
