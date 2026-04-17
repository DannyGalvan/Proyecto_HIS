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
    /// After a MedicalConsultation is created, transitions the linked appointment
    /// from "En Espera" (4) to "Consulta Médica" (5).
    /// </summary>
    public class MedicalConsultationAfterCreateInterceptor
        : IEntityAfterCreateInterceptor<MedicalConsultation, MedicalConsultationRequest>
    {
        private readonly IAppointmentStateMachine _stateMachine;

        public MedicalConsultationAfterCreateInterceptor(IAppointmentStateMachine stateMachine)
        {
            _stateMachine = stateMachine;
        }

        public Response<MedicalConsultation, List<ValidationFailure>> Execute(
            Response<MedicalConsultation, List<ValidationFailure>> response,
            MedicalConsultationRequest request)
        {
            if (response.Data?.AppointmentId == null || !response.Success)
                return response;

            var task = _stateMachine.TransitionAsync(
                response.Data.AppointmentId,
                AppointmentStateMachine.STATUS_CONSULTA_MEDICA,
                response.Data.CreatedBy);

            task.GetAwaiter().GetResult();

            return response;
        }
    }
}
