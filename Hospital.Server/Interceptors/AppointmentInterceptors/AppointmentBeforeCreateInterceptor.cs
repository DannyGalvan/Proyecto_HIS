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
    /// Also verifies that the appointment does not overlap with any active DoctorEvent
    /// (availability block) for the assigned doctor.
    /// </summary>
    public class AppointmentBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<Appointment, AppointmentRequest>
    {
        private const int APPOINTMENT_DURATION_MINUTES = 30;
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

            // Check for DoctorEvent overlap (availability blocking)
            if (response.Data.DoctorId.HasValue)
            {
                var appointmentStart = response.Data.AppointmentDate;
                var appointmentEnd = appointmentStart.AddMinutes(APPOINTMENT_DURATION_MINUTES);

                var hasEventOverlap = _db.DoctorEvents
                    .Any(e => e.DoctorId == response.Data.DoctorId.Value
                        && e.State == 1
                        && e.StartDate < appointmentEnd
                        && e.EndDate > appointmentStart);

                if (hasEventOverlap)
                {
                    response.Success = false;
                    response.Errors = new List<ValidationFailure>
                    {
                        new ValidationFailure("AppointmentDate",
                            "El médico tiene un bloqueo de disponibilidad en ese horario")
                    };
                    return response;
                }
            }

            return response;
        }
    }
}
