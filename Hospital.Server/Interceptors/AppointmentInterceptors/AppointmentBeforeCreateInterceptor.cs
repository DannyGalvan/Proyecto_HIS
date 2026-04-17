using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Services.Core;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.AppointmentInterceptors
{
    /// <summary>
    /// Ensures every new appointment starts in "Pendiente de Pago" (Id=1).
    /// Ignores any AppointmentStatusId supplied by the client.
    /// </summary>
    public class AppointmentBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<Appointment, AppointmentRequest>
    {
        private readonly DataContext _db;

        public AppointmentBeforeCreateInterceptor(DataContext db)
        {
            _db = db;
        }

        public Response<Appointment, List<ValidationFailure>> Execute(
            Response<Appointment, List<ValidationFailure>> response,
            AppointmentRequest request)
        {
            if (response.Data == null) return response;

            // Force initial status to "Pendiente de Pago" regardless of what was sent
            response.Data.AppointmentStatusId = AppointmentStateMachine.STATUS_PENDIENTE_PAGO;

            return response;
        }
    }
}
