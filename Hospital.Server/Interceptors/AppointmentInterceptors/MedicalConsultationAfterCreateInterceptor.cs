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
    /// After a MedicalConsultation is created:
    /// - If ConsultationStatus = 0 (In Progress): transitions appointment to "Consulta Médica" (5)
    /// - If ConsultationStatus = 1 (Completed): transitions appointment directly to "Evaluado" (6)
    ///   This handles the case where the doctor creates and completes the consultation in one step.
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

            // If created as completed, go straight to Evaluado; otherwise Consulta Médica
            long targetStatus = response.Data.ConsultationStatus == 1
                ? AppointmentStateMachine.STATUS_EVALUADO
                : AppointmentStateMachine.STATUS_CONSULTA_MEDICA;

            var task = _stateMachine.TransitionAsync(
                response.Data.AppointmentId,
                targetStatus,
                response.Data.CreatedBy);

            task.GetAwaiter().GetResult();

            return response;
        }
    }
}
