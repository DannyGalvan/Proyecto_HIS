using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.AppointmentInterceptors;
using Hospital.Server.Tests.Infrastructure;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class PrescriptionInterceptorTests : TestBase
    {
        private readonly PrescriptionBeforeCreateInterceptor _sut;

        public PrescriptionInterceptorTests()
        {
            _sut = new PrescriptionBeforeCreateInterceptor(DbContext);
        }

        [Fact]
        public void Execute_WhenConsultationHasStatus1_Passes()
        {
            // Arrange - seed a completed consultation
            var consultation = new MedicalConsultation
            {
                Id = 1,
                AppointmentId = 10,
                DoctorId = 2,
                ReasonForVisit = "Dolor",
                ClinicalFindings = "Normal",
                Diagnosis = "Cefalea tensional",
                ConsultationStatus = 1, // Completed
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.MedicalConsultations.Add(consultation);
            DbContext.SaveChanges();

            var prescription = new Prescription
            {
                Id = 0,
                ConsultationId = 1,
                DoctorId = 2,
                PrescriptionDate = DateTime.UtcNow,
                Notes = "Tomar con alimentos",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<Prescription, List<ValidationFailure>>
            {
                Success = true,
                Data = prescription
            };

            var request = new PrescriptionRequest
            {
                ConsultationId = 1,
                DoctorId = 2,
                CreatedBy = 2
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Errors.Should().BeNull();
        }

        [Fact]
        public void Execute_WhenConsultationStatusIsNot1_FailsWithValidationError()
        {
            // Arrange - seed an in-progress consultation (status = 0)
            var consultation = new MedicalConsultation
            {
                Id = 2,
                AppointmentId = 20,
                DoctorId = 2,
                ReasonForVisit = "Control",
                ClinicalFindings = "Normal",
                ConsultationStatus = 0, // In Progress
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.MedicalConsultations.Add(consultation);
            DbContext.SaveChanges();

            var prescription = new Prescription
            {
                Id = 0,
                ConsultationId = 2,
                DoctorId = 2,
                PrescriptionDate = DateTime.UtcNow,
                Notes = "Tomar con alimentos",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<Prescription, List<ValidationFailure>>
            {
                Success = true,
                Data = prescription
            };

            var request = new PrescriptionRequest
            {
                ConsultationId = 2,
                DoctorId = 2,
                CreatedBy = 2
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("ConsultationId");
            result.Errors![0].ErrorMessage.Should().Contain("no ha sido finalizada");
        }

        [Fact]
        public void Execute_WhenConsultationDoesNotExist_FailsWithValidationError()
        {
            // Arrange - no consultation in DB
            var prescription = new Prescription
            {
                Id = 0,
                ConsultationId = 999,
                DoctorId = 2,
                PrescriptionDate = DateTime.UtcNow,
                Notes = "Tomar con alimentos",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<Prescription, List<ValidationFailure>>
            {
                Success = true,
                Data = prescription
            };

            var request = new PrescriptionRequest
            {
                ConsultationId = 999,
                DoctorId = 2,
                CreatedBy = 2
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("ConsultationId");
            result.Errors![0].ErrorMessage.Should().Contain("no existe");
        }

        [Fact]
        public void Execute_WhenDataIsNull_ReturnsResponseUnchanged()
        {
            // Arrange
            var response = new Response<Prescription, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new PrescriptionRequest { ConsultationId = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().BeNull();
        }
    }
}
