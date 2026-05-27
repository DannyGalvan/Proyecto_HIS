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
    public class MedicalConsultationAfterUpdateInterceptorTests
    {
        private readonly Mock<IAppointmentStateMachine> _stateMachineMock;
        private readonly MedicalConsultationAfterUpdateInterceptor _sut;

        public MedicalConsultationAfterUpdateInterceptorTests()
        {
            _stateMachineMock = new Mock<IAppointmentStateMachine>();
            _stateMachineMock
                .Setup(sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((true, (string?)null));
            _sut = new MedicalConsultationAfterUpdateInterceptor(_stateMachineMock.Object);
        }

        [Fact]
        public void Execute_WhenResponseNotSuccessful_ShouldReturnUnchanged()
        {
            // Arrange
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = false,
                Data = null
            };
            var request = new MedicalConsultationRequest();
            var prevState = new MedicalConsultation { ConsultationStatus = 0, CreatedBy = 1 };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeFalse();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenConsultationStatusIsNotCompleted_ShouldNotTransition()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 1,
                AppointmentId = 10,
                DoctorId = 2,
                ConsultationStatus = 0, // not completed
                ReasonForVisit = "Test",
                ClinicalFindings = "Test",
                State = 1,
                CreatedBy = 2
            };
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = consultation
            };
            var request = new MedicalConsultationRequest();
            var prevState = new MedicalConsultation { ConsultationStatus = 0, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenAlreadyCompletedBefore_ShouldNotTransition()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 2,
                AppointmentId = 20,
                DoctorId = 2,
                ConsultationStatus = 1, // completed
                ReasonForVisit = "Test",
                ClinicalFindings = "Test",
                State = 1,
                CreatedBy = 2
            };
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = consultation
            };
            var request = new MedicalConsultationRequest();
            var prevState = new MedicalConsultation
            {
                ConsultationStatus = 1, // was already completed
                CreatedBy = 2
            };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenAppointmentIdIsZero_ShouldNotTransition()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 3,
                AppointmentId = 0,
                DoctorId = 2,
                ConsultationStatus = 1,
                ReasonForVisit = "Test",
                ClinicalFindings = "Test",
                State = 1,
                CreatedBy = 2
            };
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = consultation
            };
            var request = new MedicalConsultationRequest();
            var prevState = new MedicalConsultation { ConsultationStatus = 0, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenTransitioningToCompleted_ShouldCallTransitionWithStatusEvaluado()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 4,
                AppointmentId = 40,
                DoctorId = 2,
                ConsultationStatus = 1, // now completed
                ReasonForVisit = "Dolor",
                ClinicalFindings = "Normal",
                State = 1,
                CreatedBy = 2,
                UpdatedBy = 2
            };
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = consultation
            };
            var request = new MedicalConsultationRequest();
            var prevState = new MedicalConsultation
            {
                ConsultationStatus = 0, // was not completed
                CreatedBy = 2
            };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeTrue();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(
                    40,
                    AppointmentStateMachine.STATUS_EVALUADO,
                    2,
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public void Execute_WhenUpdatedByIsNull_ShouldUseCreatedBy()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 5,
                AppointmentId = 50,
                DoctorId = 3,
                ConsultationStatus = 1,
                ReasonForVisit = "Test",
                ClinicalFindings = "Test",
                State = 1,
                CreatedBy = 3,
                UpdatedBy = null
            };
            var response = new Response<MedicalConsultation, List<ValidationFailure>>
            {
                Success = true,
                Data = consultation
            };
            var request = new MedicalConsultationRequest();
            var prevState = new MedicalConsultation { ConsultationStatus = 0, CreatedBy = 3 };

            // Act
            _sut.Execute(response, request, prevState);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(
                    50,
                    AppointmentStateMachine.STATUS_EVALUADO,
                    3, // uses CreatedBy since UpdatedBy is null
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }
    }
}
