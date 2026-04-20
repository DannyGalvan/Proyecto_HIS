namespace Hospital.Server.Entities.Dtos
{
    /// <summary>
    /// Defines the <see cref="SlotLockEntry" />
    /// Internal storage record for the ConcurrentDictionary slot lock store.
    /// </summary>
    public record SlotLockEntry(
        long DoctorId,
        DateOnly Date,
        TimeOnly Time,
        long PatientId,
        string ConnectionId,
        DateTime ExpiresAt
    );
}
