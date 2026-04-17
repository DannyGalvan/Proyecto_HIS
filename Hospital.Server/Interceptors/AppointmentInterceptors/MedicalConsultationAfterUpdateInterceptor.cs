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
    /// After a MedicalConsultation is updated to ConsultationStatus=1 (Completed),
    /// transitions the linked appointment from "Consulta Médica" (5) to "Evaluado" (6).
    /// </summary>
    public class MedicalConsultationAfterUpdateInterceptor
        : IEntityAfterUpdateInterceptor<MedicalConsultation, MedicalConsultationRequest>
    {
        private readonly IAppointmentStateMachine _stateMachine;

        public MedicalConsultationAfterUpdateInterceptor(IAppointmentStateMachine stateMachine)
        {
            _stateMachine = stateMachine;
        }

        public Response<MedicalConsultation, List<ValidationFailure>> Execute(
            Response<MedicalConsultation, List<ValidationFailure>> response,
            MedicalConsultationRequest request,
            MedicalConsultation prevState)
        {
            if (!response.Success || response.Data == null)
                return response;

            // Only trigger when consultation is being completed
            if (response.Data.ConsultationStatus != 1)
                return response;

            // Skip if it was already completed before this update
            if (prevState.ConsultationStatus == 1)
                return response;

            if (response.Data.AppointmentId <= 0)
                return response;

            var task = _stateMachine.TransitionAsync(
                response.Data.AppointmentId,
                AppointmentStateMachine.STATUS_EVALUADO,
                response.Data.UpdatedBy ?? response.Data.CreatedBy);

            task.GetAwaiter().GetResult();

            return response;
        }
    }
}
