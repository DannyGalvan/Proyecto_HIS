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
    public class LabOrderItemBeforeCreateInterceptorTests : TestBase
    {
        private readonly LabOrderItemBeforeCreateInterceptor _sut;

        public LabOrderItemBeforeCreateInterceptorTests()
        {
            _sut = new LabOrderItemBeforeCreateInterceptor(DbContext);
        }

        [Fact]
        public void Execute_WhenDataIsNull_ShouldReturnUnchanged()
        {
            // Arrange
            var response = new Response<LabOrderItem, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };
            var request = new LabOrderItemRequest { LabExamId = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Data.Should().BeNull();
        }

        [Fact]
        public void Execute_WhenLabExamIdIsNull_ShouldReturnError()
        {
            // Arrange
            var response = new Response<LabOrderItem, List<ValidationFailure>>
            {
                Success = true,
                Data = new LabOrderItem { Id = 1, LabOrderId = 1, CreatedBy = 1 }
            };
            var request = new LabOrderItemRequest { LabExamId = null };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().NotBeEmpty();
            result.Errors![0].PropertyName.Should().Be("LabExamId");
        }

        [Fact]
        public void Execute_WhenLabExamIdIsZero_ShouldReturnError()
        {
            // Arrange
            var response = new Response<LabOrderItem, List<ValidationFailure>>
            {
                Success = true,
                Data = new LabOrderItem { Id = 1, LabOrderId = 1, CreatedBy = 1 }
            };
            var request = new LabOrderItemRequest { LabExamId = 0 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().NotBeEmpty();
        }

        [Fact]
        public void Execute_WhenLabExamNotFound_ShouldReturnError()
        {
            // Arrange
            var response = new Response<LabOrderItem, List<ValidationFailure>>
            {
                Success = true,
                Data = new LabOrderItem { Id = 1, LabOrderId = 1, CreatedBy = 1 }
            };
            var request = new LabOrderItemRequest { LabExamId = 999 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().NotBeEmpty();
            result.Errors![0].ErrorMessage.Should().Contain("no existe");
        }

        [Fact]
        public void Execute_WhenLabExamIsInactive_ShouldReturnError()
        {
            // Arrange
            DbContext.LabExams.Add(new LabExam
            {
                Id = 1,
                Name = "Hemograma",
                DefaultAmount = 100,
                State = 0, // inactive
                CreatedBy = 1
            });
            DbContext.SaveChanges();

            var response = new Response<LabOrderItem, List<ValidationFailure>>
            {
                Success = true,
                Data = new LabOrderItem { Id = 1, LabOrderId = 1, CreatedBy = 1 }
            };
            var request = new LabOrderItemRequest { LabExamId = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().NotBeEmpty();
        }

        [Fact]
        public void Execute_WhenLabExamExists_ShouldCopyNameAndAmount()
        {
            // Arrange
            DbContext.LabExams.Add(new LabExam
            {
                Id = 2,
                Name = "Glucosa en Sangre",
                DefaultAmount = 75.50m,
                State = 1,
                CreatedBy = 1
            });
            DbContext.SaveChanges();

            var response = new Response<LabOrderItem, List<ValidationFailure>>
            {
                Success = true,
                Data = new LabOrderItem { Id = 1, LabOrderId = 1, CreatedBy = 1 }
            };
            var request = new LabOrderItemRequest { LabExamId = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.ExamName.Should().Be("Glucosa en Sangre");
            result.Data.Amount.Should().Be(75.50m);
        }

        [Fact]
        public void Execute_WhenLabExamHasZeroDefaultAmount_ShouldSetAmountToZero()
        {
            // Arrange
            DbContext.LabExams.Add(new LabExam
            {
                Id = 3,
                Name = "Examen Gratuito",
                DefaultAmount = 0,
                State = 1,
                CreatedBy = 1
            });
            DbContext.SaveChanges();

            var response = new Response<LabOrderItem, List<ValidationFailure>>
            {
                Success = true,
                Data = new LabOrderItem { Id = 1, LabOrderId = 1, CreatedBy = 1 }
            };
            var request = new LabOrderItemRequest { LabExamId = 3 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.ExamName.Should().Be("Examen Gratuito");
            result.Data.Amount.Should().Be(0);
        }
    }
}
