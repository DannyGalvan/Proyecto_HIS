using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;

namespace Hospital.Server.Interceptors.DoctorTaskInterceptors
{
    /// <summary>
    /// Before creating a DoctorTask:
    /// - Validates DoctorId matches the authenticated user (CreatedBy from JWT)
    /// </summary>
    public class DoctorTaskBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<DoctorTask, DoctorTaskRequest>
    {
        private readonly DataContext _db;

        public DoctorTaskBeforeCreateInterceptor(DataContext db)
        {
            _db = db;
        }

        public Response<DoctorTask, List<ValidationFailure>> Execute(
            Response<DoctorTask, List<ValidationFailure>> response,
            DoctorTaskRequest request)
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
                        "No tiene permisos para crear tareas para otro doctor.")
                };
                return response;
            }

            return response;
        }
    }
}
