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
    /// After a LabOrder is created:
    /// 1. Recalculates TotalAmount = SUM(Items.Amount) where State=1,
    ///    ignoring any TotalAmount sent by the frontend.
    /// 2. For internal orders, transitions the linked appointment
    ///    from "Evaluado" (6) to "Laboratorio" (7).
    ///    External lab orders (IsExternal=true) do NOT trigger this transition
    ///    since the patient leaves the facility for exams.
    /// </summary>
    public class LabOrderAfterCreateInterceptor
        : IEntityAfterCreateInterceptor<LabOrder, LabOrderRequest>
    {
        private readonly IAppointmentStateMachine _stateMachine;
        private readonly DataContext _db;

        public LabOrderAfterCreateInterceptor(IAppointmentStateMachine stateMachine, DataContext db)
        {
            _stateMachine = stateMachine;
            _db = db;
        }

        public Response<LabOrder, List<ValidationFailure>> Execute(
            Response<LabOrder, List<ValidationFailure>> response,
            LabOrderRequest request)
        {
            if (!response.Success || response.Data == null)
                return response;

            // --- Recalculate TotalAmount from active items (Req 7.2, 7.5) ---
            RecalculateTotalAmount(response.Data);

            // --- Appointment state transition (existing logic) ---

            // External labs don't transition appointment state
            if (response.Data.IsExternal)
                return response;

            // Resolve the Appointment from the Consultation
            if (response.Data.ConsultationId <= 0)
                return response;

            var consultation = _db.MedicalConsultations
                .AsNoTracking()
                .FirstOrDefault(c => c.Id == response.Data.ConsultationId);

            if (consultation == null)
                return response;

            var task = _stateMachine.TransitionAsync(
                consultation.AppointmentId,
                AppointmentStateMachine.STATUS_LABORATORIO,
                response.Data.CreatedBy);

            task.GetAwaiter().GetResult();

            return response;
        }

        /// <summary>
        /// Recalculates TotalAmount as the sum of Amount for all active LabOrderItems (State=1).
        /// Ignores any TotalAmount sent by the frontend.
        /// Persists the recalculated value to the database.
        /// </summary>
        private void RecalculateTotalAmount(LabOrder labOrder)
        {
            var totalAmount = _db.Set<LabOrderItem>()
                .Where(i => i.LabOrderId == labOrder.Id && i.State == 1)
                .Sum(i => i.Amount);

            labOrder.TotalAmount = totalAmount;

            _db.Entry(labOrder).Property(o => o.TotalAmount).IsModified = true;
            _db.SaveChanges();
        }
    }
}
