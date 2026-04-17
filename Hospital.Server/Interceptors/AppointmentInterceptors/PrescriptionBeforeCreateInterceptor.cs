using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.AppointmentInterceptors
{
    /// <summary>
    /// Validates that a prescription can only be created when the linked
    /// MedicalConsultation has ConsultationStatus = 1 (Completed / Evaluado).
    /// A prescription cannot be issued for an in-progress consultation.
    /// </summary>
    public class PrescriptionBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<Prescription, PrescriptionRequest>
    {
        private readonly DataContext _db;

        public PrescriptionBeforeCreateInterceptor(DataContext db)
        {
            _db = db;
        }

        public Response<Prescription, List<ValidationFailure>> Execute(
            Response<Prescription, List<ValidationFailure>> response,
            PrescriptionRequest request)
        {
            if (response.Data == null) return response;

            if (request.ConsultationId == null || request.ConsultationId <= 0)
            {
                response.Success = false;
                response.Errors = [new ValidationFailure("ConsultationId",
                    "Debe especificar la consulta médica asociada a la receta.")];
                return response;
            }

            var consultation = _db.MedicalConsultations
                .AsNoTracking()
                .FirstOrDefault(c => c.Id == request.ConsultationId && c.State == 1);

            if (consultation == null)
            {
                response.Success = false;
                response.Errors = [new ValidationFailure("ConsultationId",
                    "La consulta médica especificada no existe o no está activa.")];
                return response;
            }

            if (consultation.ConsultationStatus != 1)
            {
                response.Success = false;
                response.Errors = [new ValidationFailure("ConsultationId",
                    "No se puede crear una receta para una consulta que aún no ha sido finalizada. " +
                    "Complete el diagnóstico y finalice la consulta primero.")];
                return response;
            }

            return response;
        }
    }
}
