using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;

namespace Hospital.Server.Interceptors.AppointmentInterceptors
{
    /// <summary>
    /// After a VitalSign record is created, transitions the linked appointment
    /// from "Signos Vitales" (3) to "En Espera" (4).
    /// The nurse first calls the patient (Confirmada → Signos Vitales via startVitals endpoint),
    /// then fills the vitals form. On save, the appointment automatically moves to En Espera
    /// so the doctor can see it in their queue.
    /// </summary>
    public class VitalSignAfterCreateInterceptor
        : IEntityAfterCreateInterceptor<VitalSign, VitalSignRequest>
    {
        private readonly IAppointmentStateMachine _stateMachine;

        public VitalSignAfterCreateInterceptor(IAppointmentStateMachine stateMachine)
        {
            _stateMachine = stateMachine;
        }

        public Response<VitalSign, List<ValidationFailure>> Execute(
            Response<VitalSign, List<ValidationFailure>> response,
            VitalSignRequest request)
        {
            if (response.Data?.AppointmentId == null || !response.Success)
                return response;

            // Transition: Signos Vitales (3) → En Espera (4)
            // This fires automatically after the vitals form is submitted.
            var task = _stateMachine.TransitionAsync(
                response.Data.AppointmentId,
                AppointmentStateMachine.STATUS_EN_ESPERA,
                response.Data.CreatedBy);

            task.GetAwaiter().GetResult();

            return response;
        }
    }
}
