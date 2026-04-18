using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.AppointmentInterceptors
{
    /// <summary>
    /// After creating an appointment with a DoctorId assigned, sends an email
    /// notification to the doctor using the NewAppointmentNotification template
    /// and logs it in NotificationLog (NotificationType=10).
    /// </summary>
    public class AppointmentAfterCreateNotifyDoctorInterceptor
        : IEntityAfterCreateInterceptor<Appointment, AppointmentRequest>
    {
        private const int NotificationTypeNewAppointment = 10;

        private readonly DataContext _db;
        private readonly ISendMail _mail;
        private readonly ILogger<AppointmentAfterCreateNotifyDoctorInterceptor> _logger;

        public AppointmentAfterCreateNotifyDoctorInterceptor(
            DataContext db,
            ISendMail mail,
            ILogger<AppointmentAfterCreateNotifyDoctorInterceptor> logger)
        {
            _db = db;
            _mail = mail;
            _logger = logger;
        }

        public Response<Appointment, List<ValidationFailure>> Execute(
            Response<Appointment, List<ValidationFailure>> response,
            AppointmentRequest request)
        {
            if (!response.Success || response.Data == null)
                return response;

            var appointment = response.Data;

            // Only notify if a doctor is assigned
            if (appointment.DoctorId == null || appointment.DoctorId == 0)
                return response;

            try
            {
                SendNotificationAsync(appointment).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                // Log error but don't fail the appointment creation
                _logger.LogError(ex, "Error enviando notificación de nueva cita al doctor {DoctorId}", appointment.DoctorId);
            }

            return response;
        }

        private async Task SendNotificationAsync(Appointment appointment)
        {
            var doctor = await _db.Users
                .Include(u => u.Timezone)
                .FirstOrDefaultAsync(u => u.Id == appointment.DoctorId);

            if (doctor == null || string.IsNullOrWhiteSpace(doctor.Email))
                return;

            // Get patient name
            var patient = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == appointment.PatientId);

            // Get specialty name
            var specialty = await _db.Specialties
                .FirstOrDefaultAsync(s => s.Id == appointment.SpecialtyId);

            // Convert appointment date to doctor's local time
            var ianaId = doctor.Timezone?.IanaId ?? "America/Guatemala";
            TimeZoneInfo tzInfo;
            try
            {
                tzInfo = TimeZoneInfo.FindSystemTimeZoneById(ianaId);
            }
            catch
            {
                tzInfo = TimeZoneInfo.FindSystemTimeZoneById("America/Guatemala");
            }

            var localDate = TimeZoneInfo.ConvertTimeFromUtc(appointment.AppointmentDate, tzInfo);

            var data = new Dictionary<string, string>
            {
                { "NombreDoctor", doctor.Name },
                { "NombrePaciente", patient?.Name ?? "Paciente" },
                { "FechaCita", localDate.ToString("dddd, dd 'de' MMMM 'de' yyyy") },
                { "HoraCita", localDate.ToString("HH:mm") },
                { "Especialidad", specialty?.Name ?? "—" },
                { "MotivoCita", appointment.Reason ?? "—" }
            };

            var subject = $"Nueva Cita Agendada — {patient?.Name ?? "Paciente"} ({localDate:dd/MM/yyyy HH:mm})";

            bool emailSent;
            string? errorMsg = null;

            try
            {
                emailSent = _mail.SendWithTemplate(doctor.Email, subject,
                    EmailTemplateType.NewAppointmentNotification, data);
                if (!emailSent) errorMsg = "El servicio de correo retornó false";
            }
            catch (Exception ex)
            {
                emailSent = false;
                errorMsg = ex.Message;
            }

            _db.NotificationLogs.Add(new NotificationLog
            {
                RecipientEmail = doctor.Email,
                Subject = subject,
                NotificationType = NotificationTypeNewAppointment,
                RelatedEntityType = "Appointment",
                RelatedEntityId = appointment.Id,
                SentAt = emailSent ? DateTime.UtcNow : null,
                Status = emailSent ? 1 : 2,
                RetryCount = 0,
                ErrorMessage = errorMsg,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1 // System user
            });

            await _db.SaveChangesAsync();
        }
    }
}
