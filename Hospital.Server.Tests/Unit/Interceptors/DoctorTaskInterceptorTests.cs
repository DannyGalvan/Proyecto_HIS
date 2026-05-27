using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.DoctorTaskInterceptors;
using Hospital.Server.Tests.Infrastructure;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class DoctorTaskInterceptorTests : TestBase
    {
        private readonly DoctorTaskBeforeCreateInterceptor _sut;

        public DoctorTaskInterceptorTests()
        {
            _sut = new DoctorTaskBeforeCreateInterceptor(DbContext);
        }

        [Fact]
        public void Execute_WhenDoctorIdMatchesCreatedBy_Passes()
        {
            // Arrange
            var entity = new DoctorTask
            {
                Id = 0,
                DoctorId = 2,
                Title = "Revisar resultados",
                Description = "Tarea de prueba",
                DueDate = DateTime.UtcNow.AddDays(1),
                IsCompleted = false,
                Priority = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2 // Same as DoctorId
            };

            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DoctorTaskRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Errors.Should().BeNull();
        }

        [Fact]
        public void Execute_WhenDoctorIdDoesNotMatchCreatedBy_FailsWithValidationError()
        {
            // Arrange
            var entity = new DoctorTask
            {
                Id = 0,
                DoctorId = 5, // Different from CreatedBy
                Title = "Revisar resultados",
                Description = "Tarea de prueba",
                DueDate = DateTime.UtcNow.AddDays(1),
                IsCompleted = false,
                Priority = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2 // Different from DoctorId
            };

            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DoctorTaskRequest { DoctorId = 5, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("DoctorId");
            result.Errors![0].ErrorMessage.Should().Contain("permisos");
            result.Errors[0].ErrorMessage.Should().Contain("tareas");
        }

        [Fact]
        public void Execute_WhenDataIsNull_ReturnsResponseUnchanged()
        {
            // Arrange
            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new DoctorTaskRequest();

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().BeNull();
        }
    }
}
