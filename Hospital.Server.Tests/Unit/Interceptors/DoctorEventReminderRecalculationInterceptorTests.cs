using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.DoctorEventInterceptors;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class DoctorEventReminderRecalculationInterceptorTests : TestBase
    {
        private readonly DoctorEventReminderRecalculationInterceptor _sut;
        private readonly Mock<ILogger<DoctorEventReminderRecalculationInterceptor>> _loggerMock;

        public DoctorEventReminderRecalculationInterceptorTests()
        {
            _loggerMock = new Mock<ILogger<DoctorEventReminderRecalculationInterceptor>>();
            _sut = new DoctorEventReminderRecalculationInterceptor(DbContext, _loggerMock.Object);
        }

        [Fact]
        public void Execute_AfterCreate_CancelsExistingNotificationLogEntries()
        {
            // Arrange - seed pending notification logs for a DoctorEvent
            const long eventId = 1L;
            var notifications = new[]
            {
                new NotificationLog
                {
                    Id = 1,
                    RecipientEmail = "doctor@test.com",
                    Subject = "Recordatorio 1h",
                    NotificationType = 11, // EventReminder1h
                    RelatedEntityType = "DoctorEvent",
                    RelatedEntityId = eventId,
                    Status = 1, // Pending/Sent
                    State = 1,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = 1
                },
                new NotificationLog
                {
                    Id = 2,
                    RecipientEmail = "doctor@test.com",
                    Subject = "Recordatorio 15m",
                    NotificationType = 12, // EventReminder15m
                    RelatedEntityType = "DoctorEvent",
                    RelatedEntityId = eventId,
                    Status = 1, // Pending/Sent
                    State = 1,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = 1
                },
                // This one should NOT be cancelled (different entity type)
                new NotificationLog
                {
                    Id = 3,
                    RecipientEmail = "doctor@test.com",
                    Subject = "Other notification",
                    NotificationType = 7,
                    RelatedEntityType = "DoctorTask",
                    RelatedEntityId = eventId,
                    Status = 1,
                    State = 1,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = 1
                }
            };

            DbContext.NotificationLogs.AddRange(notifications);
            DbContext.SaveChanges();

            var doctorEvent = new DoctorEvent
            {
                Id = eventId,
                DoctorId = 2,
                Title = "Updated Event",
                StartDate = DateTime.UtcNow.AddHours(1),
                EndDate = DateTime.UtcNow.AddHours(2),
                EventType = 0,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = doctorEvent
            };

            var request = new DoctorEventRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            _sut.Execute(response, request);

            // Assert - DoctorEvent notifications should be cancelled (Status = 0)
            var cancelledNotifications = DbContext.NotificationLogs
                .Where(n => n.RelatedEntityType == "DoctorEvent" && n.RelatedEntityId == eventId)
                .ToList();

            cancelledNotifications.Should().HaveCount(2);
            cancelledNotifications.Should().AllSatisfy(n =>
            {
                n.Status.Should().Be(0); // Cancelled
                n.UpdatedAt.Should().NotBeNull();
                n.UpdatedBy.Should().Be(1); // System
            });

            // The DoctorTask notification should remain unchanged
            var taskNotification = DbContext.NotificationLogs.Find(3L);
            taskNotification!.Status.Should().Be(1); // Still active
        }

        [Fact]
        public void Execute_WhenResponseNotSuccess_DoesNotCancelReminders()
        {
            // Arrange
            var notification = new NotificationLog
            {
                Id = 10,
                RecipientEmail = "doctor@test.com",
                Subject = "Recordatorio",
                NotificationType = 11,
                RelatedEntityType = "DoctorEvent",
                RelatedEntityId = 5,
                Status = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.NotificationLogs.Add(notification);
            DbContext.SaveChanges();

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = false,
                Data = new DoctorEvent { Id = 5 }
            };

            var request = new DoctorEventRequest();

            // Act
            _sut.Execute(response, request);

            // Assert - notification should remain unchanged
            var unchanged = DbContext.NotificationLogs.Find(10L);
            unchanged!.Status.Should().Be(1);
        }

        [Fact]
        public void Execute_WhenNoExistingReminders_DoesNotThrow()
        {
            // Arrange - no notifications in DB
            var doctorEvent = new DoctorEvent
            {
                Id = 99,
                DoctorId = 2,
                Title = "New Event",
                StartDate = DateTime.UtcNow.AddHours(1),
                EndDate = DateTime.UtcNow.AddHours(2),
                EventType = 0,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = doctorEvent
            };

            var request = new DoctorEventRequest { DoctorId = 2, CreatedBy = 2 };

            // Act & Assert - should not throw
            var result = _sut.Execute(response, request);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public void Execute_AfterUpdate_CancelsExistingNotificationLogEntries()
        {
            // Arrange
            const long eventId = 50L;
            DbContext.NotificationLogs.Add(new NotificationLog
            {
                Id = 50,
                RecipientEmail = "doctor@test.com",
                Subject = "Event Reminder",
                NotificationType = 11,
                RelatedEntityType = "DoctorEvent",
                RelatedEntityId = eventId,
                Status = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            });
            DbContext.SaveChanges();

            var doctorEvent = new DoctorEvent
            {
                Id = eventId,
                DoctorId = 2,
                Title = "Updated Event",
                StartDate = DateTime.UtcNow.AddHours(3),
                EndDate = DateTime.UtcNow.AddHours(4),
                EventType = 0,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var prevState = new DoctorEvent
            {
                Id = eventId,
                DoctorId = 2,
                Title = "Original Event",
                StartDate = DateTime.UtcNow.AddHours(1),
                EndDate = DateTime.UtcNow.AddHours(2),
                EventType = 0,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = true,
                Data = doctorEvent
            };

            var request = new DoctorEventRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeTrue();
            var notification = DbContext.NotificationLogs.Find(50L);
            notification!.Status.Should().Be(0); // Cancelled
        }

        [Fact]
        public void Execute_AfterUpdate_WhenResponseNotSuccess_DoesNotCancel()
        {
            // Arrange
            DbContext.NotificationLogs.Add(new NotificationLog
            {
                Id = 51,
                RecipientEmail = "doctor@test.com",
                Subject = "Event Reminder",
                NotificationType = 11,
                RelatedEntityType = "DoctorEvent",
                RelatedEntityId = 60,
                Status = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            });
            DbContext.SaveChanges();

            var response = new Response<DoctorEvent, List<ValidationFailure>>
            {
                Success = false,
                Data = null
            };

            var request = new DoctorEventRequest();
            var prevState = new DoctorEvent { Id = 60, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeFalse();
            var notification = DbContext.NotificationLogs.Find(51L);
            notification!.Status.Should().Be(1); // Unchanged
        }
    }
}
