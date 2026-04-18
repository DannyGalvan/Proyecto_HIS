using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.DoctorEventInterceptors
{
    /// <summary>
    /// Before creating a DoctorEvent:
    /// - Validates StartDate is before EndDate
    /// - Validates no overlap with existing active DoctorEvents of the same doctor
    /// - If IsAllDay=true, adjusts StartDate to 00:00 UTC and EndDate to 23:59 UTC
    /// - Validates DoctorId matches the authenticated user (CreatedBy from JWT)
    /// </summary>
    public class DoctorEventBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<DoctorEvent, DoctorEventRequest>
    {
        private readonly DataContext _db;

        public DoctorEventBeforeCreateInterceptor(DataContext db)
        {
            _db = db;
        }

        public Response<DoctorEvent, List<ValidationFailure>> Execute(
            Response<DoctorEvent, List<ValidationFailure>> response,
            DoctorEventRequest request)
        {
            if (response.Data == null) return response;

            var entity = response.Data;

            // Validate DoctorId matches authenticated user (CreatedBy represents the JWT user)
            if (entity.DoctorId != entity.CreatedBy)
            {
                response.Success = false;
                response.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("DoctorId",
                        "No tiene permisos para crear eventos para otro doctor.")
                };
                return response;
            }

            // If IsAllDay, adjust StartDate to 00:00 UTC and EndDate to 23:59 UTC
            if (entity.IsAllDay)
            {
                entity.StartDate = new DateTime(entity.StartDate.Year, entity.StartDate.Month, entity.StartDate.Day, 0, 0, 0, DateTimeKind.Utc);
                entity.EndDate = new DateTime(entity.EndDate.Year, entity.EndDate.Month, entity.EndDate.Day, 23, 59, 59, DateTimeKind.Utc);
            }

            // Validate StartDate < EndDate
            if (entity.StartDate >= entity.EndDate)
            {
                response.Success = false;
                response.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("StartDate",
                        "La fecha de inicio debe ser anterior a la fecha de fin")
                };
                return response;
            }

            // Validate no overlap with existing active DoctorEvents of the same doctor
            var hasOverlap = _db.DoctorEvents
                .Any(e => e.DoctorId == entity.DoctorId
                    && e.State == 1
                    && e.StartDate < entity.EndDate
                    && e.EndDate > entity.StartDate);

            if (hasOverlap)
            {
                response.Success = false;
                response.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("StartDate",
                        "Ya existe un evento que se superpone con el horario seleccionado")
                };
                return response;
            }

            return response;
        }
    }
}
