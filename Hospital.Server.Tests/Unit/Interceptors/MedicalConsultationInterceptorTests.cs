using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.AppointmentInterceptors;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class MedicalConsultationInterceptorTests
    {
        private readonly Mock<IAppointmentStateMachine> _stateMachineMock;
        private readonly MedicalConsultationAfterCreateInterceptor _sut;

        public MedicalConsultationInterceptorTests()
        {
            _stateMachineMock = new Mock<IAppointmentStateMachine>();
            _stateMachineMock
                .Setup(sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((true, (string?)null));
            _sut = new MedicalConsultationAfterCreateInterceptor(_stateMachineMock.Object);
        }

        [Fact]
        public void Execute_WithConsultationStatus0_CallsTransitionWithStatusConsultaMedica()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 1,
                AppointmentId = 10,
                DoctorId = 2,
                ConsultationStatus = 0,
                ReasonForVisit = "Dolor de cabeza",
                ClinicalFindings = "Cefalea tensional",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = consultation
            };

            var request = new MedicalConsultationRequest
            {
                AppointmentId = 10,
                DoctorId = 2,
                ConsultationStatus = 0,
                CreatedBy = 2
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(
                    10,
                    AppointmentStateMachine.STATUS_CONSULTA_MEDICA,
                    2,
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public void Execute_WithConsultationStatus1_CallsTransitionWithStatusEvaluado()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 2,
                AppointmentId = 20,
                DoctorId = 3,
                ConsultationStatus = 1,
                ReasonForVisit = "Control",
                ClinicalFindings = "Normal",
                Diagnosis = "Paciente sano",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };

            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = consultation
            };

            var request = new MedicalConsultationRequest
            {
                AppointmentId = 20,
                DoctorId = 3,
                ConsultationStatus = 1,
                CreatedBy = 3
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(
                    20,
                    AppointmentStateMachine.STATUS_EVALUADO,
                    3,
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public void Execute_WhenResponseNotSuccess_DoesNotCallTransition()
        {
            // Arrange
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = false,
                Data = new MedicalConsultation { AppointmentId = 10, CreatedBy = 2 }
            };

            var request = new MedicalConsultationRequest();

            // Act
            _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenDataIsNull_DoesNotCallTransition()
        {
            // Arrange
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new MedicalConsultationRequest();

            // Act
            _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }
    }
}
