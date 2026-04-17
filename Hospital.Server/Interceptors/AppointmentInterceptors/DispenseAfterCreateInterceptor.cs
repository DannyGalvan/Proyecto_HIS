using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.AppointmentInterceptors
{
    /// <summary>
    /// After a Dispense record is created (pharmacy):
    /// 1. Recalculates TotalAmount = SUM(Items.UnitPrice × Items.Quantity) where State=1,
    ///    ignoring any TotalAmount sent by the frontend.
    /// 2. Transitions the linked appointment
    ///    from "Evaluado" (6) or "Laboratorio" (7) to "Farmacia" (8).
    /// </summary>
    public class DispenseAfterCreateInterceptor
        : IEntityAfterCreateInterceptor<Dispense, DispenseRequest>
    {
        private readonly IAppointmentStateMachine _stateMachine;
        private readonly DataContext _db;

        public DispenseAfterCreateInterceptor(IAppointmentStateMachine stateMachine, DataContext db)
        {
            _stateMachine = stateMachine;
            _db = db;
        }

        public Response<Dispense, List<ValidationFailure>> Execute(
            Response<Dispense, List<ValidationFailure>> response,
            DispenseRequest request)
        {
            if (!response.Success || response.Data == null)
                return response;

            // --- Recalculate TotalAmount from active items (Req 9.2, 9.5) ---
            RecalculateTotalAmount(response.Data);

            // --- Appointment state transition (existing logic) ---

            if (response.Data.PrescriptionId <= 0)
                return response;

            // Resolve Appointment via Prescription → MedicalConsultation
            var prescription = _db.Prescriptions
                .AsNoTracking()
                .FirstOrDefault(p => p.Id == response.Data.PrescriptionId);

            if (prescription == null)
                return response;

            var consultation = _db.MedicalConsultations
                .AsNoTracking()
                .FirstOrDefault(c => c.Id == prescription.ConsultationId);

            if (consultation == null)
                return response;

            var task = _stateMachine.TransitionAsync(
                consultation.AppointmentId,
                AppointmentStateMachine.STATUS_FARMACIA,
                response.Data.CreatedBy);

            task.GetAwaiter().GetResult();

            return response;
        }

        /// <summary>
        /// Recalculates TotalAmount as the sum of (UnitPrice × Quantity) for all active DispenseItems (State=1).
        /// Ignores any TotalAmount sent by the frontend.
        /// Persists the recalculated value to the database.
        /// </summary>
        private void RecalculateTotalAmount(Dispense dispense)
        {
            var totalAmount = _db.Set<DispenseItem>()
                .Where(i => i.DispenseId == dispense.Id && i.State == 1)
                .Sum(i => i.UnitPrice * i.Quantity);

            dispense.TotalAmount = totalAmount;

            _db.Entry(dispense).Property(d => d.TotalAmount).IsModified = true;
            _db.SaveChanges();
        }
    }
}
