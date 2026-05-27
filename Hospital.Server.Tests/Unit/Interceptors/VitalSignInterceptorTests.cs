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
    public class VitalSignInterceptorTests
    {
        private readonly Mock<IAppointmentStateMachine> _stateMachineMock;
        private readonly VitalSignAfterCreateInterceptor _sut;

        public VitalSignInterceptorTests()
        {
            _stateMachineMock = new Mock<IAppointmentStateMachine>();
            _stateMachineMock
                .Setup(sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((true, (string?)null));
            _sut = new VitalSignAfterCreateInterceptor(_stateMachineMock.Object);
        }

        [Fact]
        public void Execute_WithSuccessfulVitalSign_CallsTransitionWithStatusEnEspera()
        {
            // Arrange
            var vitalSign = new VitalSign
            {
                Id = 1,
                AppointmentId = 15,
                NurseId = 5,
                BloodPressureSystolic = 120,
                BloodPressureDiastolic = 80,
                Temperature = 36.5m,
                Weight = 70m,
                Height = 170m,
                HeartRate = 72,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 5
            };

            var response = new Response<VitalSign, List<ValidationFailure>>
            {
                Success = true,
                Data = vitalSign
            };

            var request = new VitalSignRequest
            {
                AppointmentId = 15,
                NurseId = 5,
                CreatedBy = 5
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(
                    15,
                    AppointmentStateMachine.STATUS_EN_ESPERA,
                    5,
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public void Execute_WhenResponseNotSuccess_DoesNotCallTransition()
        {
            // Arrange
            var response = new Response<VitalSign, List<ValidationFailure>>
            {
                Success = false,
                Data = new VitalSign { AppointmentId = 15, CreatedBy = 5 }
            };

            var request = new VitalSignRequest();

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
            var response = new Response<VitalSign, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new VitalSignRequest();

            // Act
            _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }
    }
}
