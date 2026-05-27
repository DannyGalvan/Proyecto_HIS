using FluentAssertions;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    public class EmailTemplatesTests
    {
        #region AppointmentConfirmation

        [Fact]
        public void AppointmentConfirmation_ShouldContainPatientName()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Juan Pérez", "Cardiología", "Dr. García",
                "Sede Central", "2025-07-15 09:00", 123,
                "TXN-001", 150.00m);

            // Assert
            html.Should().Contain("Juan Pérez");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldContainSpecialtyName()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "María López", "Dermatología", "Dra. Martínez",
                "Sede Norte", "2025-08-01 14:30", 456,
                "TXN-002", 200.00m);

            // Assert
            html.Should().Contain("Dermatología");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldContainDoctorName()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Carlos Ruiz", "Pediatría", "Dr. Hernández",
                "Sede Sur", "2025-09-10 11:00", 789,
                "TXN-003", 100.00m);

            // Assert
            html.Should().Contain("Dr. Hernández");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldContainTransactionNumber()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Ana García", "Oftalmología", "Dr. López",
                "Sede Este", "2025-07-20 08:00", 101,
                "TXN-ABC123", 75.50m);

            // Assert
            html.Should().Contain("TXN-ABC123");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldContainAmount()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Pedro Sánchez", "Neurología", "Dr. Ramírez",
                "Sede Oeste", "2025-10-05 16:00", 202,
                "TXN-XYZ", 350.75m);

            // Assert
            html.Should().Contain("Q350.75");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldContainBranchName()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Laura Díaz", "Ginecología", "Dra. Torres",
                "Hospital Central Guatemala", "2025-11-15 10:30", 303,
                "TXN-999", 500.00m);

            // Assert
            html.Should().Contain("Hospital Central Guatemala");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldContainAppointmentId()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Roberto Méndez", "Traumatología", "Dr. Castillo",
                "Sede Principal", "2025-12-01 07:30", 12345,
                "TXN-LONG", 250.00m);

            // Assert
            html.Should().Contain("#12345");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldBeValidHtml()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Test", "Spec", "Doc", "Branch",
                "2025-01-01 08:00", 1, "TXN-1", 10.00m);

            // Assert
            html.Should().Contain("<!DOCTYPE html>");
            html.Should().Contain("</html>");
            html.Should().Contain("Cita Confirmada");
        }

        [Fact]
        public void AppointmentConfirmation_ShouldContainSuccessBanner()
        {
            // Act
            var html = EmailTemplates.AppointmentConfirmation(
                "Test", "Spec", "Doc", "Branch",
                "2025-01-01 08:00", 1, "TXN-1", 10.00m);

            // Assert
            html.Should().Contain("Pago confirmado");
        }

        #endregion

        #region AppointmentReminder

        [Fact]
        public void AppointmentReminder_ShouldContainPatientName()
        {
            // Act
            var html = EmailTemplates.AppointmentReminder(
                "Juan Pérez", "24 horas", "Cardiología",
                "Dr. García", "Sede Central", "2025-07-15 09:00", 123);

            // Assert
            html.Should().Contain("Juan Pérez");
        }

        [Fact]
        public void AppointmentReminder_ShouldContainTimeLabel()
        {
            // Act
            var html = EmailTemplates.AppointmentReminder(
                "María López", "4 horas", "Dermatología",
                "Dra. Martínez", "Sede Norte", "2025-08-01 14:30", 456);

            // Assert
            html.Should().Contain("4 horas");
        }

        [Fact]
        public void AppointmentReminder_ShouldContainReminderTitle()
        {
            // Act
            var html = EmailTemplates.AppointmentReminder(
                "Test", "24 horas", "Spec", "Doc",
                "Branch", "2025-01-01 08:00", 1);

            // Assert
            html.Should().Contain("Recordatorio de Cita");
        }

        [Fact]
        public void AppointmentReminder_ShouldContainDoctorAndSpecialty()
        {
            // Act
            var html = EmailTemplates.AppointmentReminder(
                "Carlos", "1 hora", "Pediatría",
                "Dr. Hernández", "Sede Sur", "2025-09-10 11:00", 789);

            // Assert
            html.Should().Contain("Pediatría");
            html.Should().Contain("Dr. Hernández");
        }

        [Fact]
        public void AppointmentReminder_ShouldContainAppointmentDate()
        {
            // Act
            var html = EmailTemplates.AppointmentReminder(
                "Test", "24 horas", "Spec", "Doc",
                "Branch", "2025-07-15 09:00", 1);

            // Assert
            html.Should().Contain("2025-07-15 09:00");
        }

        #endregion

        #region AppointmentCancellation

        [Fact]
        public void AppointmentCancellation_ShouldContainPatientName()
        {
            // Act
            var html = EmailTemplates.AppointmentCancellation(
                "Juan Pérez", "Cardiología", "Dr. García",
                "Sede Central", "2025-07-15 09:00", 123, 150.00m);

            // Assert
            html.Should().Contain("Juan Pérez");
        }

        [Fact]
        public void AppointmentCancellation_ShouldContainCancelledTitle()
        {
            // Act
            var html = EmailTemplates.AppointmentCancellation(
                "Test", "Spec", "Doc", "Branch",
                "2025-01-01 08:00", 1, 50.00m);

            // Assert
            html.Should().Contain("Cita Cancelada");
        }

        [Fact]
        public void AppointmentCancellation_ShouldContainAmount()
        {
            // Act
            var html = EmailTemplates.AppointmentCancellation(
                "Ana García", "Oftalmología", "Dr. López",
                "Sede Este", "2025-07-20 08:00", 101, 275.50m);

            // Assert
            html.Should().Contain("Q275.50");
        }

        [Fact]
        public void AppointmentCancellation_ShouldContainCancellationBanner()
        {
            // Act
            var html = EmailTemplates.AppointmentCancellation(
                "Test", "Spec", "Doc", "Branch",
                "2025-01-01 08:00", 1, 100.00m);

            // Assert
            html.Should().Contain("Cita cancelada");
        }

        [Fact]
        public void AppointmentCancellation_ShouldContainAppointmentDetails()
        {
            // Act
            var html = EmailTemplates.AppointmentCancellation(
                "Roberto", "Traumatología", "Dr. Castillo",
                "Sede Principal", "2025-12-01 07:30", 555, 300.00m);

            // Assert
            html.Should().Contain("Traumatología");
            html.Should().Contain("Dr. Castillo");
            html.Should().Contain("Sede Principal");
            html.Should().Contain("#555");
        }

        #endregion

        #region PatientWelcome

        [Fact]
        public void PatientWelcome_ShouldContainPatientName()
        {
            // Act
            var html = EmailTemplates.PatientWelcome(
                "Juan Pérez", "jperez", "juan@email.com");

            // Assert
            html.Should().Contain("Juan Pérez");
        }

        [Fact]
        public void PatientWelcome_ShouldContainUserName()
        {
            // Act
            var html = EmailTemplates.PatientWelcome(
                "María López", "mlopez", "maria@email.com");

            // Assert
            html.Should().Contain("mlopez");
        }

        [Fact]
        public void PatientWelcome_ShouldContainEmail()
        {
            // Act
            var html = EmailTemplates.PatientWelcome(
                "Carlos Ruiz", "cruiz", "carlos@hospital.com");

            // Assert
            html.Should().Contain("carlos@hospital.com");
        }

        [Fact]
        public void PatientWelcome_ShouldContainWelcomeTitle()
        {
            // Act
            var html = EmailTemplates.PatientWelcome(
                "Test", "testuser", "test@test.com");

            // Assert
            html.Should().Contain("Bienvenido a Hospital HIS");
        }

        [Fact]
        public void PatientWelcome_ShouldContainRegistrationBanner()
        {
            // Act
            var html = EmailTemplates.PatientWelcome(
                "Test", "testuser", "test@test.com");

            // Assert
            html.Should().Contain("Registro completado");
        }

        [Fact]
        public void PatientWelcome_ShouldBeValidHtml()
        {
            // Act
            var html = EmailTemplates.PatientWelcome(
                "Test", "user", "email@test.com");

            // Assert
            html.Should().Contain("<!DOCTYPE html>");
            html.Should().Contain("</html>");
            html.Should().Contain("Hospital HIS");
        }

        #endregion
    }
}
