using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.AppointmentInterceptors;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class AppointmentBeforeCreateInterceptorTests : TestBase
    {
        private readonly AppointmentBeforeCreateInterceptor _sut;

        public AppointmentBeforeCreateInterceptorTests()
        {
            _sut = new AppointmentBeforeCreateInterceptor(DbContext);
        }

        #region Sets AppointmentStatusId to STATUS_PENDIENTE_PAGO

        [Fact]
        public void Execute_SetsAppointmentStatusIdToStatusPendientePago()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 0,
                PatientId = 1,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 99, // Client sends arbitrary status
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Consulta general",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest
            {
                PatientId = 1,
                DoctorId = 2,
                AppointmentStatusId = 99,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.AppointmentStatusId.Should().Be(AppointmentStateMachine.STATUS_PENDIENTE_PAGO);
        }

        [Fact]
        public void Execute_WhenDataIsNull_ReturnsResponseUnchanged()
        {
            // Arrange
            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new AppointmentRequest { CreatedBy = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().BeNull();
        }

        #endregion

        #region DoctorEvent Overlap Validation

        [Fact]
        public void Execute_WhenAppointmentOverlapsWithActiveDoctorEvent_FailsWithValidationError()
        {
            // Arrange - seed an active DoctorEvent
            var baseTime = new DateTime(2025, 7, 10, 14, 0, 0, DateTimeKind.Utc);
            var existingEvent = new DoctorEvent
            {
                Id = 1,
                DoctorId = 2,
                Title = "Reunión médica",
                StartDate = baseTime,
                EndDate = baseTime.AddHours(2),
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.DoctorEvents.Add(existingEvent);
            DbContext.SaveChanges();

            // Appointment at 14:30 overlaps with event [14:00 - 16:00]
            var appointment = new Appointment
            {
                Id = 0,
                PatientId = 1,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = baseTime.AddMinutes(30), // 14:30 - overlaps
                Reason = "Consulta general",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest
            {
                PatientId = 1,
                DoctorId = 2,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("AppointmentDate");
            result.Errors![0].ErrorMessage.Should().Contain("bloqueo de disponibilidad");
        }

        [Fact]
        public void Execute_WhenNoOverlapWithDoctorEvent_Passes()
        {
            // Arrange - seed an active DoctorEvent
            var baseTime = new DateTime(2025, 7, 10, 14, 0, 0, DateTimeKind.Utc);
            var existingEvent = new DoctorEvent
            {
                Id = 1,
                DoctorId = 2,
                Title = "Reunión médica",
                StartDate = baseTime,
                EndDate = baseTime.AddHours(2),
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.DoctorEvents.Add(existingEvent);
            DbContext.SaveChanges();

            // Appointment at 17:00 does NOT overlap with event [14:00 - 16:00]
            var appointment = new Appointment
            {
                Id = 0,
                PatientId = 1,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = baseTime.AddHours(3), // 17:00 - no overlap
                Reason = "Consulta general",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest
            {
                PatientId = 1,
                DoctorId = 2,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.AppointmentStatusId.Should().Be(AppointmentStateMachine.STATUS_PENDIENTE_PAGO);
        }

        [Fact]
        public void Execute_WhenDoctorEventIsInactive_DoesNotBlockAppointment()
        {
            // Arrange - seed an INACTIVE DoctorEvent (State = 0)
            var baseTime = new DateTime(2025, 7, 10, 14, 0, 0, DateTimeKind.Utc);
            var inactiveEvent = new DoctorEvent
            {
                Id = 1,
                DoctorId = 2,
                Title = "Cancelled Event",
                StartDate = baseTime,
                EndDate = baseTime.AddHours(2),
                EventType = 0,
                IsAllDay = false,
                State = 0, // Inactive
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.DoctorEvents.Add(inactiveEvent);
            DbContext.SaveChanges();

            // Appointment overlaps with the inactive event
            var appointment = new Appointment
            {
                Id = 0,
                PatientId = 1,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = baseTime.AddMinutes(30),
                Reason = "Consulta general",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest
            {
                PatientId = 1,
                DoctorId = 2,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert - inactive event should not block
            result.Success.Should().BeTrue();
            result.Data!.AppointmentStatusId.Should().Be(AppointmentStateMachine.STATUS_PENDIENTE_PAGO);
        }

        [Fact]
        public void Execute_WhenDoctorIdIsNull_SkipsOverlapCheck()
        {
            // Arrange - seed an active DoctorEvent
            var baseTime = new DateTime(2025, 7, 10, 14, 0, 0, DateTimeKind.Utc);
            var existingEvent = new DoctorEvent
            {
                Id = 1,
                DoctorId = 2,
                Title = "Reunión",
                StartDate = baseTime,
                EndDate = baseTime.AddHours(2),
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.DoctorEvents.Add(existingEvent);
            DbContext.SaveChanges();

            // Appointment without DoctorId
            var appointment = new Appointment
            {
                Id = 0,
                PatientId = 1,
                DoctorId = null, // No doctor assigned
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = baseTime.AddMinutes(30),
                Reason = "Consulta general",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest
            {
                PatientId = 1,
                DoctorId = null,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert - should pass since no doctor to check overlap for
            result.Success.Should().BeTrue();
            result.Data!.AppointmentStatusId.Should().Be(AppointmentStateMachine.STATUS_PENDIENTE_PAGO);
        }

        #endregion
    }

    public class AppointmentAfterCreateNotifyDoctorInterceptorTests : TestBase
    {
        private readonly Mock<ISendMail> _sendMailMock;
        private readonly Mock<ILogger<AppointmentAfterCreateNotifyDoctorInterceptor>> _loggerMock;
        private readonly AppointmentAfterCreateNotifyDoctorInterceptor _sut;

        public AppointmentAfterCreateNotifyDoctorInterceptorTests()
        {
            _sendMailMock = new Mock<ISendMail>();
            _loggerMock = new Mock<ILogger<AppointmentAfterCreateNotifyDoctorInterceptor>>();
            _sut = new AppointmentAfterCreateNotifyDoctorInterceptor(DbContext, _sendMailMock.Object, _loggerMock.Object);
        }

        [Fact]
        public void Execute_WithDoctorAssigned_CallsSendWithTemplateAndCreatesNotificationLog()
        {
            // Arrange - seed doctor, patient, and specialty
            var doctor = new User
            {
                Id = 2,
                Name = "Dr. García",
                Email = "garcia@hospital.com",
                UserName = "drgarcia",
                Password = "hashed",
                IdentificationDocument = "1234567890123",
                Number = "55551234",
                RolId = 2,
                TimezoneId = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var timezone = new Timezone
            {
                Id = 1,
                IanaId = "America/Guatemala",
                DisplayName = "(UTC-06:00) America/Guatemala",
                UtcOffset = "-06:00",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var patient = new User
            {
                Id = 1,
                Name = "Juan Pérez",
                Email = "juan@email.com",
                UserName = "juanperez",
                Password = "hashed",
                IdentificationDocument = "9876543210123",
                Number = "55559876",
                RolId = 3,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var specialty = new Specialty
            {
                Id = 1,
                Name = "Medicina General",
                Description = "Consulta general",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            DbContext.Users.AddRange(doctor, patient);
            DbContext.Timezones.Add(timezone);
            DbContext.Specialties.Add(specialty);
            DbContext.SaveChanges();

            _sendMailMock
                .Setup(m => m.SendWithTemplate(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<EmailTemplateType>(),
                    It.IsAny<Dictionary<string, string>>()))
                .Returns(true);

            var appointment = new Appointment
            {
                Id = 10,
                PatientId = 1,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Dolor de cabeza persistente",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest
            {
                PatientId = 1,
                DoctorId = 2,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();

            // Verify SendWithTemplate was called
            _sendMailMock.Verify(
                m => m.SendWithTemplate(
                    "garcia@hospital.com",
                    It.Is<string>(s => s.Contains("Nueva Cita Agendada")),
                    EmailTemplateType.NewAppointmentNotification,
                    It.IsAny<Dictionary<string, string>>()),
                Times.Once);

            // Verify NotificationLog was created
            var notificationLog = DbContext.NotificationLogs.FirstOrDefault();
            notificationLog.Should().NotBeNull();
            notificationLog!.RecipientEmail.Should().Be("garcia@hospital.com");
            notificationLog.NotificationType.Should().Be(10);
            notificationLog.RelatedEntityType.Should().Be("Appointment");
            notificationLog.RelatedEntityId.Should().Be(10);
            notificationLog.Status.Should().Be(1); // Sent
            notificationLog.State.Should().Be(1);
        }

        [Fact]
        public void Execute_WhenDoctorIdIsNull_DoesNotSendEmailOrCreateLog()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 11,
                PatientId = 1,
                DoctorId = null, // No doctor assigned
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Consulta general",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest { PatientId = 1, CreatedBy = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            _sendMailMock.Verify(
                m => m.SendWithTemplate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<EmailTemplateType>(), It.IsAny<Dictionary<string, string>>()),
                Times.Never);
            DbContext.NotificationLogs.Should().BeEmpty();
        }

        [Fact]
        public void Execute_WhenResponseNotSuccess_DoesNotSendEmail()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 12,
                PatientId = 1,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Consulta",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = false, // Failed response
                Data = appointment
            };

            var request = new AppointmentRequest { PatientId = 1, DoctorId = 2, CreatedBy = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            _sendMailMock.Verify(
                m => m.SendWithTemplate(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<EmailTemplateType>(), It.IsAny<Dictionary<string, string>>()),
                Times.Never);
            DbContext.NotificationLogs.Should().BeEmpty();
        }

        [Fact]
        public void Execute_WhenSendMailFails_CreatesNotificationLogWithFailedStatus()
        {
            // Arrange - seed doctor
            var doctor = new User
            {
                Id = 3,
                Name = "Dr. López",
                Email = "lopez@hospital.com",
                UserName = "drlopez",
                Password = "hashed",
                IdentificationDocument = "1111111111111",
                Number = "55551111",
                RolId = 2,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var patient = new User
            {
                Id = 4,
                Name = "María García",
                Email = "maria@email.com",
                UserName = "mariagarcia",
                Password = "hashed",
                IdentificationDocument = "2222222222222",
                Number = "55552222",
                RolId = 3,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            DbContext.Users.AddRange(doctor, patient);
            DbContext.SaveChanges();

            _sendMailMock
                .Setup(m => m.SendWithTemplate(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<EmailTemplateType>(),
                    It.IsAny<Dictionary<string, string>>()))
                .Returns(false); // Email sending fails

            var appointment = new Appointment
            {
                Id = 13,
                PatientId = 4,
                DoctorId = 3,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Control de rutina",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 4
            };

            var response = new Response<Appointment, List<ValidationFailure>>
            {
                Success = true,
                Data = appointment
            };

            var request = new AppointmentRequest { PatientId = 4, DoctorId = 3, CreatedBy = 4 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert - appointment creation should still succeed
            result.Success.Should().BeTrue();

            // NotificationLog should be created with failed status
            var notificationLog = DbContext.NotificationLogs.FirstOrDefault();
            notificationLog.Should().NotBeNull();
            notificationLog!.RecipientEmail.Should().Be("lopez@hospital.com");
            notificationLog.NotificationType.Should().Be(10);
            notificationLog.RelatedEntityType.Should().Be("Appointment");
            notificationLog.RelatedEntityId.Should().Be(13);
            notificationLog.Status.Should().Be(2); // Failed
            notificationLog.SentAt.Should().BeNull();
        }
    }
}
