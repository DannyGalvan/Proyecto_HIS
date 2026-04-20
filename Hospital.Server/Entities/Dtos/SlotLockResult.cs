namespace Hospital.Server.Entities.Dtos
{
    /// <summary>
    /// Defines the <see cref="SlotLockResult" />
    /// Result of a slot lock attempt, including optional lock info and released previous lock.
    /// </summary>
    public record SlotLockResult(
        bool Success,
        string? Reason = null,
        SlotLockInfo? LockInfo = null,
        SlotLockInfo? ReleasedPrevious = null
    );
}
