using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Services.Core
{
    /// <summary>
    /// Centralized appointment state machine.
    /// All status transitions must go through this service to enforce valid flow.
    /// </summary>
    public class AppointmentStateMachine : IAppointmentStateMachine
    {
        private readonly DataContext _db;

        public AppointmentStateMachine(DataContext db)
        {
            _db = db;
        }

        // ── Status ID constants (must match AppointmentStatusConfiguration seeds) ──
        public const long STATUS_PENDIENTE_PAGO   = 1;
        public const long STATUS_CONFIRMADA        = 2;
        public const long STATUS_SIGNOS_VITALES    = 3;
        public const long STATUS_EN_ESPERA         = 4;
        public const long STATUS_CONSULTA_MEDICA   = 5;
        public const long STATUS_EVALUADO          = 6;
        public const long STATUS_LABORATORIO       = 7;
        public const long STATUS_FARMACIA          = 8;
        public const long STATUS_ATENCION_FINAL    = 9;
        public const long STATUS_NO_ASISTIO        = 10;
        public const long STATUS_CANCELADA         = 11;

        /// <summary>
        /// Valid transitions map: from → allowed next states
        /// </summary>
        private static readonly Dictionary<long, HashSet<long>> _allowedTransitions = new()
        {
            // Pendiente de Pago → Confirmada (via payment) or Cancelada
            [STATUS_PENDIENTE_PAGO] = new() { STATUS_CONFIRMADA, STATUS_CANCELADA },

            // Confirmada → Signos Vitales (nurse selects patient) or No Asistió
            [STATUS_CONFIRMADA] = new() { STATUS_SIGNOS_VITALES, STATUS_NO_ASISTIO, STATUS_CANCELADA },

            // Signos Vitales → En Espera (nurse completes vitals)
            [STATUS_SIGNOS_VITALES] = new() { STATUS_EN_ESPERA },

            // En Espera → Consulta Médica (doctor picks patient) or directly to Evaluado
            // (when doctor creates and completes the consultation in one step)
            [STATUS_EN_ESPERA] = new() { STATUS_CONSULTA_MEDICA, STATUS_EVALUADO, STATUS_NO_ASISTIO },

            // Consulta Médica → Evaluado (doctor completes consultation)
            [STATUS_CONSULTA_MEDICA] = new() { STATUS_EVALUADO },

            // Evaluado → Laboratorio, Farmacia, or Atención Finalizada
            [STATUS_EVALUADO] = new() { STATUS_LABORATORIO, STATUS_FARMACIA, STATUS_ATENCION_FINAL },

            // Laboratorio → Farmacia or Atención Finalizada
            [STATUS_LABORATORIO] = new() { STATUS_FARMACIA, STATUS_ATENCION_FINAL },

            // Farmacia → Atención Finalizada
            [STATUS_FARMACIA] = new() { STATUS_ATENCION_FINAL },

            // Terminal states — no transitions allowed
            [STATUS_ATENCION_FINAL] = new(),
            [STATUS_NO_ASISTIO]     = new(),
            [STATUS_CANCELADA]      = new(),
        };

        /// <inheritdoc/>
        public bool CanTransition(long fromStatusId, long toStatusId)
        {
            return _allowedTransitions.TryGetValue(fromStatusId, out var allowed)
                && allowed.Contains(toStatusId);
        }

        /// <inheritdoc/>
        public async Task<(bool Success, string? Error)> TransitionAsync(
            long appointmentId,
            long toStatusId,
            long updatedBy,
            CancellationToken ct = default)
        {
            var appointment = await _db.Appointments
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.State == 1, ct);

            if (appointment == null)
                return (false, "Cita no encontrada");

            if (!CanTransition(appointment.AppointmentStatusId, toStatusId))
            {
                var currentName = await GetStatusNameAsync(appointment.AppointmentStatusId, ct);
                var targetName  = await GetStatusNameAsync(toStatusId, ct);
                return (false, $"Transición no permitida: '{currentName}' → '{targetName}'");
            }

            appointment.AppointmentStatusId = toStatusId;
            appointment.UpdatedAt = DateTime.UtcNow;
            appointment.UpdatedBy = updatedBy;

            await _db.SaveChangesAsync(ct);
            return (true, null);
        }

        private async Task<string> GetStatusNameAsync(long statusId, CancellationToken ct)
        {
            var status = await _db.AppointmentStatuses.FindAsync(new object[] { statusId }, ct);
            return status?.Name ?? statusId.ToString();
        }
    }
}
