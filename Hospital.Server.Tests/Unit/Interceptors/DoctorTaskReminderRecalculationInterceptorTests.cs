using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.DoctorTaskInterceptors;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class DoctorTaskReminderRecalculationInterceptorTests : TestBase
    {
        private readonly DoctorTaskReminderRecalculationInterceptor _sut;
        private readonly Mock<ILogger<DoctorTaskReminderRecalculationInterceptor>> _loggerMock;

        public DoctorTaskReminderRecalculationInterceptorTests()
        {
            _loggerMock = new Mock<ILogger<DoctorTaskReminderRecalculationInterceptor>>();
            _sut = new DoctorTaskReminderRecalculationInterceptor(DbContext, _loggerMock.Object);
        }

        [Fact]
        public void Execute_AfterCreate_CancelsExistingNotificationLogEntries()
        {
            // Arrange - seed pending notification logs for a DoctorTask
            const long taskId = 1L;
            var notifications = new[]
            {
                new NotificationLog
                {
                    Id = 1,
                    RecipientEmail = "doctor@test.com",
                    Subject = "Agenda diaria",
                    NotificationType = 7, // DailyAgenda
                    RelatedEntityType = "DoctorTask",
                    RelatedEntityId = taskId,
                    Status = 1, // Pending/Sent
                    State = 1,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = 1
                },
                new NotificationLog
                {
                    Id = 2,
                    RecipientEmail = "doctor@test.com",
                    Subject = "Recordatorio tarea",
                    NotificationType = 7,
                    RelatedEntityType = "DoctorTask",
                    RelatedEntityId = taskId,
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
                    Subject = "Event reminder",
                    NotificationType = 11,
                    RelatedEntityType = "DoctorEvent",
                    RelatedEntityId = taskId,
                    Status = 1,
                    State = 1,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = 1
                }
            };

            DbContext.NotificationLogs.AddRange(notifications);
            DbContext.SaveChanges();

            var doctorTask = new DoctorTask
            {
                Id = taskId,
                DoctorId = 2,
                Title = "Updated Task",
                DueDate = DateTime.UtcNow.AddDays(1),
                IsCompleted = false,
                Priority = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = true,
                Data = doctorTask
            };

            var request = new DoctorTaskRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            _sut.Execute(response, request);

            // Assert - DoctorTask notifications should be cancelled (Status = 0)
            var cancelledNotifications = DbContext.NotificationLogs
                .Where(n => n.RelatedEntityType == "DoctorTask" && n.RelatedEntityId == taskId)
                .ToList();

            cancelledNotifications.Should().HaveCount(2);
            cancelledNotifications.Should().AllSatisfy(n =>
            {
                n.Status.Should().Be(0); // Cancelled
                n.UpdatedAt.Should().NotBeNull();
                n.UpdatedBy.Should().Be(1); // System
            });

            // The DoctorEvent notification should remain unchanged
            var eventNotification = DbContext.NotificationLogs.Find(3L);
            eventNotification!.Status.Should().Be(1); // Still active
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
                NotificationType = 7,
                RelatedEntityType = "DoctorTask",
                RelatedEntityId = 5,
                Status = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.NotificationLogs.Add(notification);
            DbContext.SaveChanges();

            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = false,
                Data = new DoctorTask { Id = 5 }
            };

            var request = new DoctorTaskRequest();

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
            var doctorTask = new DoctorTask
            {
                Id = 99,
                DoctorId = 2,
                Title = "New Task",
                DueDate = DateTime.UtcNow.AddDays(1),
                IsCompleted = false,
                Priority = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = true,
                Data = doctorTask
            };

            var request = new DoctorTaskRequest { DoctorId = 2, CreatedBy = 2 };

            // Act & Assert - should not throw
            var result = _sut.Execute(response, request);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public void Execute_AfterUpdate_CancelsExistingNotificationLogEntries()
        {
            // Arrange
            const long taskId = 200L;
            DbContext.NotificationLogs.Add(new NotificationLog
            {
                Id = 100,
                RecipientEmail = "doctor@test.com",
                Subject = "Recordatorio",
                NotificationType = 7,
                RelatedEntityType = "DoctorTask",
                RelatedEntityId = taskId,
                Status = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            });
            DbContext.SaveChanges();

            var doctorTask = new DoctorTask
            {
                Id = taskId,
                DoctorId = 2,
                Title = "Updated Task",
                DueDate = DateTime.UtcNow.AddDays(2),
                IsCompleted = false,
                Priority = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var prevState = new DoctorTask
            {
                Id = taskId,
                DoctorId = 2,
                Title = "Original Task",
                DueDate = DateTime.UtcNow.AddDays(1),
                IsCompleted = false,
                Priority = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };

            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = true,
                Data = doctorTask
            };

            var request = new DoctorTaskRequest { DoctorId = 2, CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeTrue();
            var notification = DbContext.NotificationLogs.Find(100L);
            notification!.Status.Should().Be(0); // Cancelled
        }

        [Fact]
        public void Execute_AfterUpdate_WhenResponseNotSuccess_DoesNotCancel()
        {
            // Arrange
            DbContext.NotificationLogs.Add(new NotificationLog
            {
                Id = 101,
                RecipientEmail = "doctor@test.com",
                Subject = "Recordatorio",
                NotificationType = 7,
                RelatedEntityType = "DoctorTask",
                RelatedEntityId = 300,
                Status = 1,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            });
            DbContext.SaveChanges();

            var response = new Response<DoctorTask, List<ValidationFailure>>
            {
                Success = false,
                Data = null
            };

            var request = new DoctorTaskRequest();
            var prevState = new DoctorTask { Id = 300, DoctorId = 2, Title = "T", CreatedBy = 2 };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeFalse();
            var notification = DbContext.NotificationLogs.Find(101L);
            notification!.Status.Should().Be(1); // Unchanged
        }
    }
}
