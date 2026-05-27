using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.DoctorEventInterceptors;
using Hospital.Server.Tests.Infrastructure;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class DoctorEventInterceptorTests : TestBase
    {
        private readonly DoctorEventBeforeCreateInterceptor _sut;

        public DoctorEventInterceptorTests()
        {
            _sut = new DoctorEventBeforeCreateInterceptor(DbContext);
        }

        #region StartDate >= EndDate Validation

        [Fact]
        public void Execute_WhenStartDateEqualsEndDate_FailsWithValidationError()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var entity = new DoctorEvent
            {
                Id = 0,
                DoctorId = 2,
                Title = "Reunión",
                StartDate = now,
                EndDate = now, // Same as StartDate
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = now,
                CreatedBy = 2
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DoctorEventRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("StartDate");
            result.Errors![0].ErrorMessage.Should().Contain("fecha de inicio debe ser anterior");
        }

        [Fact]
        public void Execute_WhenStartDateAfterEndDate_FailsWithValidationError()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var entity = new DoctorEvent
            {
                Id = 0,
                DoctorId = 2,
                Title = "Reunión",
                StartDate = now.AddHours(2),
                EndDate = now.AddHours(1), // Before StartDate
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = now,
                CreatedBy = 2
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DoctorEventRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("StartDate");
        }

        #endregion

        #region Overlap Validation

        [Fact]
        public void Execute_WhenTimeRangeOverlapsExistingActiveEvent_FailsWithValidationError()
        {
            // Arrange - seed an existing event
            var baseTime = new DateTime(2025, 6, 15, 10, 0, 0, DateTimeKind.Utc);
            var existingEvent = new DoctorEvent
            {
                Id = 1,
                DoctorId = 2,
                Title = "Existing Event",
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

            // New event overlaps with existing
            var newEntity = new DoctorEvent
            {
                Id = 0,
                DoctorId = 2,
                Title = "Overlapping Event",
                StartDate = baseTime.AddHours(1), // Overlaps with existing
                EndDate = baseTime.AddHours(3),
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = newEntity
            };

            var request = new DoctorEventRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("StartDate");
            result.Errors![0].ErrorMessage.Should().Contain("superpone");
        }

        [Fact]
        public void Execute_WhenNoOverlapWithExistingEvents_Passes()
        {
            // Arrange - seed an existing event
            var baseTime = new DateTime(2025, 6, 15, 10, 0, 0, DateTimeKind.Utc);
            var existingEvent = new DoctorEvent
            {
                Id = 1,
                DoctorId = 2,
                Title = "Existing Event",
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

            // New event does NOT overlap (starts after existing ends)
            var newEntity = new DoctorEvent
            {
                Id = 0,
                DoctorId = 2,
                Title = "Non-overlapping Event",
                StartDate = baseTime.AddHours(3),
                EndDate = baseTime.AddHours(4),
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = newEntity
            };

            var request = new DoctorEventRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Errors.Should().BeNull();
        }

        #endregion

        #region DoctorId != CreatedBy Validation

        [Fact]
        public void Execute_WhenDoctorIdDoesNotMatchCreatedBy_FailsWithValidationError()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var entity = new DoctorEvent
            {
                Id = 0,
                DoctorId = 5, // Different from CreatedBy
                Title = "Reunión",
                StartDate = now.AddHours(1),
                EndDate = now.AddHours(2),
                EventType = 0,
                IsAllDay = false,
                State = 1,
                CreatedAt = now,
                CreatedBy = 2 // Different from DoctorId
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DoctorEventRequest { DoctorId = 5, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("DoctorId");
            result.Errors![0].ErrorMessage.Should().Contain("permisos");
        }

        #endregion
    }
}
