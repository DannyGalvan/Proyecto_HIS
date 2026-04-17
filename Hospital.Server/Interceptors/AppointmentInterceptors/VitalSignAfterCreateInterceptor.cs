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
    /// from "Confirmada" (2) to "Signos Vitales" (3).
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

            // Fire-and-forget transition (sync context — EntityService.Create is sync)
            var task = _stateMachine.TransitionAsync(
                response.Data.AppointmentId,
                AppointmentStateMachine.STATUS_SIGNOS_VITALES,
                response.Data.CreatedBy);

            task.GetAwaiter().GetResult();

            return response;
        }
    }
}
