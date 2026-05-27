using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.AppointmentInterceptors;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class LabOrderAfterCreateInterceptorTests : TestBase
    {
        private readonly Mock<IAppointmentStateMachine> _stateMachineMock;
        private readonly LabOrderAfterCreateInterceptor _sut;

        public LabOrderAfterCreateInterceptorTests()
        {
            _stateMachineMock = new Mock<IAppointmentStateMachine>();
            _stateMachineMock
                .Setup(sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((true, (string?)null));
            _sut = new LabOrderAfterCreateInterceptor(_stateMachineMock.Object, DbContext);
        }

        [Fact]
        public void Execute_WhenResponseNotSuccessful_ShouldReturnUnchanged()
        {
            // Arrange
            var response = new Response<LabOrder, List<ValidationFailure>>
            {
                Success = false,
                Data = null
            };
            var request = new LabOrderRequest();

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenExternalOrder_ShouldNotTransitionState()
        {
            // Arrange
            var labOrder = new LabOrder
            {
                Id = 1,
                ConsultationId = 10,
                DoctorId = 2,
                PatientId = 3,
                IsExternal = true,
                CreatedBy = 2,
                State = 1
            };
            DbContext.Set<LabOrder>().Add(labOrder);
            DbContext.SaveChanges();

            var response = new Response<LabOrder, List<ValidationFailure>>
            {
                Success = true,
                Data = labOrder
            };
            var request = new LabOrderRequest { ConsultationId = 10 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenConsultationIdIsZero_ShouldNotTransitionState()
        {
            // Arrange
            var labOrder = new LabOrder
            {
                Id = 2,
                ConsultationId = 0,
                DoctorId = 2,
                PatientId = 3,
                IsExternal = false,
                CreatedBy = 2,
                State = 1
            };
            DbContext.Set<LabOrder>().Add(labOrder);
            DbContext.SaveChanges();

            var response = new Response<LabOrder, List<ValidationFailure>>
            {
                Success = true,
                Data = labOrder
            };
            var request = new LabOrderRequest();

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenConsultationNotFound_ShouldNotTransitionState()
        {
            // Arrange
            var labOrder = new LabOrder
            {
                Id = 3,
                ConsultationId = 999, // non-existent
                DoctorId = 2,
                PatientId = 3,
                IsExternal = false,
                CreatedBy = 2,
                State = 1
            };
            DbContext.Set<LabOrder>().Add(labOrder);
            DbContext.SaveChanges();

            var response = new Response<LabOrder, List<ValidationFailure>>
            {
                Success = true,
                Data = labOrder
            };
            var request = new LabOrderRequest();

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenInternalOrderWithValidConsultation_ShouldTransitionToLaboratorio()
        {
            // Arrange
            var consultation = new MedicalConsultation
            {
                Id = 10,
                AppointmentId = 100,
                DoctorId = 2,
                ConsultationStatus = 1,
                ReasonForVisit = "Test",
                ClinicalFindings = "Test",
                State = 1,
                CreatedBy = 2
            };
            DbContext.MedicalConsultations.Add(consultation);
            DbContext.SaveChanges();

            var labOrder = new LabOrder
            {
                Id = 4,
                ConsultationId = 10,
                DoctorId = 2,
                PatientId = 3,
                IsExternal = false,
                CreatedBy = 2,
                State = 1
            };
            DbContext.Set<LabOrder>().Add(labOrder);
            DbContext.SaveChanges();

            var response = new Response<LabOrder, List<ValidationFailure>>
            {
                Success = true,
                Data = labOrder
            };
            var request = new LabOrderRequest();

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(
                    100,
                    AppointmentStateMachine.STATUS_LABORATORIO,
                    2,
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public void Execute_ShouldRecalculateTotalAmountFromActiveItems()
        {
            // Arrange
            var labOrder = new LabOrder
            {
                Id = 5,
                ConsultationId = 0,
                DoctorId = 2,
                PatientId = 3,
                IsExternal = true, // external so we don't need consultation
                TotalAmount = 0,
                CreatedBy = 2,
                State = 1
            };
            DbContext.Set<LabOrder>().Add(labOrder);
            DbContext.SaveChanges();

            // Add items
            DbContext.Set<LabOrderItem>().AddRange(
                new LabOrderItem { Id = 1, LabOrderId = 5, LabExamId = 1, ExamName = "Exam1", Amount = 100, State = 1, CreatedBy = 2 },
                new LabOrderItem { Id = 2, LabOrderId = 5, LabExamId = 2, ExamName = "Exam2", Amount = 50, State = 1, CreatedBy = 2 },
                new LabOrderItem { Id = 3, LabOrderId = 5, LabExamId = 3, ExamName = "Exam3", Amount = 75, State = 0, CreatedBy = 2 } // inactive
            );
            DbContext.SaveChanges();

            var response = new Response<LabOrder, List<ValidationFailure>>
            {
                Success = true,
                Data = labOrder
            };
            var request = new LabOrderRequest();

            // Act
            var result = _sut.Execute(response, request);

            // Assert - only active items (State=1) should be summed
            result.Data!.TotalAmount.Should().Be(150); // 100 + 50
        }
    }
}
