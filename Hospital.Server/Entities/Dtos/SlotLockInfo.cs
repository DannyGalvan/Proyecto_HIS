namespace Hospital.Server.Entities.Dtos
{
    /// <summary>
    /// Defines the <see cref="SlotLockInfo" />
    /// Slot lock information for SignalR transmission to connected clients.
    /// </summary>
    public record SlotLockInfo(
        long DoctorId,
        string Date,      // format "yyyy-MM-dd"
        string Time,      // format "HH:mm"
        DateTime ExpiresAt
    );
}
