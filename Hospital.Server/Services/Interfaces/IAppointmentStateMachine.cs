namespace Hospital.Server.Services.Interfaces
{
    /// <summary>
    /// Enforces valid appointment status transitions.
    /// </summary>
    public interface IAppointmentStateMachine
    {
        /// <summary>
        /// Returns true if the transition from <paramref name="fromStatusId"/> to
        /// <paramref name="toStatusId"/> is allowed by the state machine.
        /// </summary>
        bool CanTransition(long fromStatusId, long toStatusId);

        /// <summary>
        /// Applies a status transition to an appointment, persisting the change.
        /// Returns (true, null) on success or (false, errorMessage) on failure.
        /// </summary>
        Task<(bool Success, string? Error)> TransitionAsync(
            long appointmentId,
            long toStatusId,
            long updatedBy,
            CancellationToken ct = default);
    }
}
