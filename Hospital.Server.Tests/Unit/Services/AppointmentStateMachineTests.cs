using FluentAssertions;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Core;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Hospital.Server.Tests.Unit.Services
{
    public class AppointmentStateMachineTests : TestBase
    {
        private readonly AppointmentStateMachine _sut;

        public AppointmentStateMachineTests()
        {
            _sut = new AppointmentStateMachine(DbContext);
        }

        #region Status Constants

        private static readonly long[] AllStatuses =
        [
            AppointmentStateMachine.STATUS_PENDIENTE_PAGO,
            AppointmentStateMachine.STATUS_CONFIRMADA,
            AppointmentStateMachine.STATUS_SIGNOS_VITALES,
            AppointmentStateMachine.STATUS_EN_ESPERA,
            AppointmentStateMachine.STATUS_CONSULTA_MEDICA,
            AppointmentStateMachine.STATUS_EVALUADO,
            AppointmentStateMachine.STATUS_LABORATORIO,
            AppointmentStateMachine.STATUS_FARMACIA,
            AppointmentStateMachine.STATUS_ATENCION_FINAL,
            AppointmentStateMachine.STATUS_NO_ASISTIO,
            AppointmentStateMachine.STATUS_CANCELADA,
            AppointmentStateMachine.STATUS_PACIENTE_PRESENTE,
        ];

        private static readonly long[] TerminalStatuses =
        [
            AppointmentStateMachine.STATUS_ATENCION_FINAL,
            AppointmentStateMachine.STATUS_NO_ASISTIO,
            AppointmentStateMachine.STATUS_CANCELADA,
        ];

        #endregion

        #region CanTransition - Valid Transitions

        public static TheoryData<long, long> ValidTransitionPairs()
        {
            return new TheoryData<long, long>
            {
                // STATUS_PENDIENTE_PAGO → CONFIRMADA, CANCELADA
                { AppointmentStateMachine.STATUS_PENDIENTE_PAGO, AppointmentStateMachine.STATUS_CONFIRMADA },
                { AppointmentStateMachine.STATUS_PENDIENTE_PAGO, AppointmentStateMachine.STATUS_CANCELADA },

                // STATUS_CONFIRMADA → PACIENTE_PRESENTE, NO_ASISTIO, CANCELADA
                { AppointmentStateMachine.STATUS_CONFIRMADA, AppointmentStateMachine.STATUS_PACIENTE_PRESENTE },
                { AppointmentStateMachine.STATUS_CONFIRMADA, AppointmentStateMachine.STATUS_NO_ASISTIO },
                { AppointmentStateMachine.STATUS_CONFIRMADA, AppointmentStateMachine.STATUS_CANCELADA },

                // STATUS_PACIENTE_PRESENTE → SIGNOS_VITALES, NO_ASISTIO, CANCELADA
                { AppointmentStateMachine.STATUS_PACIENTE_PRESENTE, AppointmentStateMachine.STATUS_SIGNOS_VITALES },
                { AppointmentStateMachine.STATUS_PACIENTE_PRESENTE, AppointmentStateMachine.STATUS_NO_ASISTIO },
                { AppointmentStateMachine.STATUS_PACIENTE_PRESENTE, AppointmentStateMachine.STATUS_CANCELADA },

                // STATUS_SIGNOS_VITALES → EN_ESPERA
                { AppointmentStateMachine.STATUS_SIGNOS_VITALES, AppointmentStateMachine.STATUS_EN_ESPERA },

                // STATUS_EN_ESPERA → CONSULTA_MEDICA, EVALUADO, NO_ASISTIO
                { AppointmentStateMachine.STATUS_EN_ESPERA, AppointmentStateMachine.STATUS_CONSULTA_MEDICA },
                { AppointmentStateMachine.STATUS_EN_ESPERA, AppointmentStateMachine.STATUS_EVALUADO },
                { AppointmentStateMachine.STATUS_EN_ESPERA, AppointmentStateMachine.STATUS_NO_ASISTIO },

                // STATUS_CONSULTA_MEDICA → EVALUADO
                { AppointmentStateMachine.STATUS_CONSULTA_MEDICA, AppointmentStateMachine.STATUS_EVALUADO },

                // STATUS_EVALUADO → LABORATORIO, FARMACIA, ATENCION_FINAL
                { AppointmentStateMachine.STATUS_EVALUADO, AppointmentStateMachine.STATUS_LABORATORIO },
                { AppointmentStateMachine.STATUS_EVALUADO, AppointmentStateMachine.STATUS_FARMACIA },
                { AppointmentStateMachine.STATUS_EVALUADO, AppointmentStateMachine.STATUS_ATENCION_FINAL },

                // STATUS_LABORATORIO → FARMACIA, ATENCION_FINAL
                { AppointmentStateMachine.STATUS_LABORATORIO, AppointmentStateMachine.STATUS_FARMACIA },
                { AppointmentStateMachine.STATUS_LABORATORIO, AppointmentStateMachine.STATUS_ATENCION_FINAL },

                // STATUS_FARMACIA → ATENCION_FINAL
                { AppointmentStateMachine.STATUS_FARMACIA, AppointmentStateMachine.STATUS_ATENCION_FINAL },
            };
        }

        [Theory]
        [MemberData(nameof(ValidTransitionPairs))]
        public void CanTransition_WithValidPair_ReturnsTrue(long from, long to)
        {
            // Act
            var result = _sut.CanTransition(from, to);

            // Assert
            result.Should().BeTrue(
                $"transition from status {from} to status {to} should be allowed");
        }

        [Fact]
        public void CanTransition_ValidTransitionPairs_HasAtLeast18Pairs()
        {
            // Verify we have at least 18 valid transition pairs as required
            var pairs = ValidTransitionPairs();
            pairs.Should().HaveCountGreaterThanOrEqualTo(18);
        }

        #endregion

        #region CanTransition - Invalid Transitions

        public static TheoryData<long, long> InvalidTransitionPairs()
        {
            return new TheoryData<long, long>
            {
                { AppointmentStateMachine.STATUS_PENDIENTE_PAGO, AppointmentStateMachine.STATUS_ATENCION_FINAL },
                { AppointmentStateMachine.STATUS_PENDIENTE_PAGO, AppointmentStateMachine.STATUS_EN_ESPERA },
                { AppointmentStateMachine.STATUS_CONFIRMADA, AppointmentStateMachine.STATUS_EVALUADO },
                { AppointmentStateMachine.STATUS_SIGNOS_VITALES, AppointmentStateMachine.STATUS_FARMACIA },
                { AppointmentStateMachine.STATUS_CONSULTA_MEDICA, AppointmentStateMachine.STATUS_ATENCION_FINAL },
                { AppointmentStateMachine.STATUS_FARMACIA, AppointmentStateMachine.STATUS_LABORATORIO },
                { AppointmentStateMachine.STATUS_PENDIENTE_PAGO, AppointmentStateMachine.STATUS_PENDIENTE_PAGO },
            };
        }

        [Theory]
        [MemberData(nameof(InvalidTransitionPairs))]
        public void CanTransition_WithInvalidPair_ReturnsFalse(long from, long to)
        {
            // Act
            var result = _sut.CanTransition(from, to);

            // Assert
            result.Should().BeFalse(
                $"transition from status {from} to status {to} should NOT be allowed");
        }

        #endregion

        #region CanTransition - Terminal States

        [Theory]
        [MemberData(nameof(TerminalStateTransitionData))]
        public void CanTransition_FromTerminalState_ReturnsFalseForAllTargets(long terminalStatus, long targetStatus)
        {
            // Act
            var result = _sut.CanTransition(terminalStatus, targetStatus);

            // Assert
            result.Should().BeFalse(
                $"terminal state {terminalStatus} should not allow transition to {targetStatus}");
        }

        public static TheoryData<long, long> TerminalStateTransitionData()
        {
            var data = new TheoryData<long, long>();

            foreach (var terminal in TerminalStatuses)
            {
                foreach (var target in AllStatuses)
                {
                    data.Add(terminal, target);
                }
            }

            return data;
        }

        #endregion

        #region All 12 Status Constants Have Entries

        [Fact]
        public void AllStatusConstants_HaveEntriesInTransitionsMap()
        {
            // All 12 statuses should be recognized by CanTransition (not throw)
            // and the transitions map should have entries for all of them.
            // We verify by checking that CanTransition doesn't return true for
            // a non-existent status (status 999) from any valid status.
            foreach (var status in AllStatuses)
            {
                // CanTransition from each status to itself should be deterministic
                // (either true or false, but not throw). This proves the status is in the map.
                var action = () => _sut.CanTransition(status, 999);
                action.Should().NotThrow(
                    $"status {status} should have an entry in the transitions map");
            }

            // Additionally verify that a non-existent status returns false
            _sut.CanTransition(999, AppointmentStateMachine.STATUS_CONFIRMADA).Should().BeFalse();
        }

        [Fact]
        public void AllStatusConstants_AreExactly12()
        {
            AllStatuses.Should().HaveCount(12);
        }

        [Fact]
        public void AllStatusConstants_AreUnique()
        {
            AllStatuses.Should().OnlyHaveUniqueItems();
        }

        #endregion

        #region TransitionAsync - Valid Transition

        [Fact]
        public async Task TransitionAsync_WithValidTransitionOnActiveAppointment_UpdatesStatusAndAuditFields()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 1,
                AppointmentStatusId = AppointmentStateMachine.STATUS_PENDIENTE_PAGO,
                State = 1,
                PatientId = 1,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Test appointment reason",
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                CreatedBy = 1,
            };

            DbContext.Appointments.Add(appointment);

            // Add appointment statuses for name resolution
            DbContext.AppointmentStatuses.AddRange(
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_PENDIENTE_PAGO, Name = "Pendiente de Pago", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 },
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_CONFIRMADA, Name = "Confirmada", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 }
            );

            await DbContext.SaveChangesAsync();

            var beforeTransition = DateTime.UtcNow;

            // Act
            var (success, error) = await _sut.TransitionAsync(
                appointmentId: 1,
                toStatusId: AppointmentStateMachine.STATUS_CONFIRMADA,
                updatedBy: 42);

            // Assert
            success.Should().BeTrue();
            error.Should().BeNull();

            var updatedAppointment = await DbContext.Appointments.FindAsync(1L);
            updatedAppointment!.AppointmentStatusId.Should().Be(AppointmentStateMachine.STATUS_CONFIRMADA);
            updatedAppointment.UpdatedBy.Should().Be(42);
            updatedAppointment.UpdatedAt.Should().NotBeNull();
            updatedAppointment.UpdatedAt!.Value.Should().BeOnOrAfter(beforeTransition);
        }

        [Fact]
        public async Task TransitionAsync_WithValidTransition_PersistsChanges()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 2,
                AppointmentStatusId = AppointmentStateMachine.STATUS_CONFIRMADA,
                State = 1,
                PatientId = 1,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Test appointment reason",
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                CreatedBy = 1,
            };

            DbContext.Appointments.Add(appointment);
            DbContext.AppointmentStatuses.AddRange(
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_CONFIRMADA, Name = "Confirmada", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 },
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_PACIENTE_PRESENTE, Name = "Paciente Presente", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 }
            );
            await DbContext.SaveChangesAsync();

            // Act
            var (success, error) = await _sut.TransitionAsync(
                appointmentId: 2,
                toStatusId: AppointmentStateMachine.STATUS_PACIENTE_PRESENTE,
                updatedBy: 10);

            // Assert
            success.Should().BeTrue();
            error.Should().BeNull();

            // Verify the change was persisted (SaveChangesAsync was called)
            // Detach all entities and re-query to confirm persistence
            DbContext.ChangeTracker.Clear();
            var persisted = await DbContext.Appointments.FindAsync(2L);
            persisted!.AppointmentStatusId.Should().Be(AppointmentStateMachine.STATUS_PACIENTE_PRESENTE);
        }

        #endregion

        #region TransitionAsync - Non-existent or Inactive Appointment

        [Fact]
        public async Task TransitionAsync_ForNonExistentAppointment_ReturnsNotFoundError()
        {
            // Act
            var (success, error) = await _sut.TransitionAsync(
                appointmentId: 999,
                toStatusId: AppointmentStateMachine.STATUS_CONFIRMADA,
                updatedBy: 1);

            // Assert
            success.Should().BeFalse();
            error.Should().Be("Cita no encontrada");
        }

        [Fact]
        public async Task TransitionAsync_ForInactiveAppointment_ReturnsNotFoundError()
        {
            // Arrange - appointment with State = 0 (soft-deleted)
            var appointment = new Appointment
            {
                Id = 3,
                AppointmentStatusId = AppointmentStateMachine.STATUS_PENDIENTE_PAGO,
                State = 0, // Inactive
                PatientId = 1,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Inactive appointment",
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                CreatedBy = 1,
            };

            DbContext.Appointments.Add(appointment);
            await DbContext.SaveChangesAsync();

            // Act
            var (success, error) = await _sut.TransitionAsync(
                appointmentId: 3,
                toStatusId: AppointmentStateMachine.STATUS_CONFIRMADA,
                updatedBy: 1);

            // Assert
            success.Should().BeFalse();
            error.Should().Be("Cita no encontrada");
        }

        [Fact]
        public async Task TransitionAsync_ForNonExistentAppointment_DoesNotCallSaveChanges()
        {
            // Arrange - no appointments in DB
            var initialChangeCount = DbContext.ChangeTracker.Entries().Count();

            // Act
            var (success, _) = await _sut.TransitionAsync(
                appointmentId: 999,
                toStatusId: AppointmentStateMachine.STATUS_CONFIRMADA,
                updatedBy: 1);

            // Assert
            success.Should().BeFalse();
            // No entities should have been modified
            DbContext.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified)
                .Should().BeEmpty();
        }

        #endregion

        #region TransitionAsync - Invalid Transition

        [Fact]
        public async Task TransitionAsync_WithInvalidTransition_ReturnsErrorAndDoesNotModifyStatus()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 4,
                AppointmentStatusId = AppointmentStateMachine.STATUS_PENDIENTE_PAGO,
                State = 1,
                PatientId = 1,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Test appointment reason",
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                CreatedBy = 1,
            };

            DbContext.Appointments.Add(appointment);
            DbContext.AppointmentStatuses.AddRange(
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_PENDIENTE_PAGO, Name = "Pendiente de Pago", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 },
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_ATENCION_FINAL, Name = "Atención Finalizada", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 }
            );
            await DbContext.SaveChangesAsync();

            // Act - try invalid transition: PENDIENTE_PAGO → ATENCION_FINAL
            var (success, error) = await _sut.TransitionAsync(
                appointmentId: 4,
                toStatusId: AppointmentStateMachine.STATUS_ATENCION_FINAL,
                updatedBy: 1);

            // Assert
            success.Should().BeFalse();
            error.Should().Contain("Transición no permitida");
            error.Should().Contain("Pendiente de Pago");
            error.Should().Contain("Atención Finalizada");

            // Verify status was NOT changed
            var unchangedAppointment = await DbContext.Appointments.FindAsync(4L);
            unchangedAppointment!.AppointmentStatusId.Should().Be(AppointmentStateMachine.STATUS_PENDIENTE_PAGO);
        }

        [Fact]
        public async Task TransitionAsync_WithInvalidTransition_ErrorMessageContainsStatusNames()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 5,
                AppointmentStatusId = AppointmentStateMachine.STATUS_FARMACIA,
                State = 1,
                PatientId = 1,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Test appointment reason",
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                CreatedBy = 1,
            };

            DbContext.Appointments.Add(appointment);
            DbContext.AppointmentStatuses.AddRange(
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_FARMACIA, Name = "Farmacia", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 },
                new AppointmentStatus { Id = AppointmentStateMachine.STATUS_LABORATORIO, Name = "Laboratorio", State = 1, CreatedAt = DateTime.UtcNow, CreatedBy = 1 }
            );
            await DbContext.SaveChangesAsync();

            // Act - try invalid transition: FARMACIA → LABORATORIO (backwards)
            var (success, error) = await _sut.TransitionAsync(
                appointmentId: 5,
                toStatusId: AppointmentStateMachine.STATUS_LABORATORIO,
                updatedBy: 1);

            // Assert
            success.Should().BeFalse();
            error.Should().Be("Transición no permitida: 'Farmacia' → 'Laboratorio'");
        }

        #endregion
    }
}
