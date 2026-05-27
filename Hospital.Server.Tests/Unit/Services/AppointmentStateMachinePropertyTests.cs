// Feature: unit-integration-test-coverage, Property 4: AppointmentStateMachine invalid transitions are rejected
// Feature: unit-integration-test-coverage, Property 5: AppointmentStateMachine valid transitions succeed
// Validates: Requirements 5.2, 5.3, 5.5, 5.7

using FluentAssertions;
using FsCheck;
using FsCheck.Fluent;
using FsCheck.Xunit;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Core;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Hospital.Server.Tests.Unit.Services
{
    public class AppointmentStateMachinePropertyTests : TestBase
    {
        private readonly AppointmentStateMachine _sut;

        // All valid status IDs in the state machine
        private static readonly long[] AllStatusIds =
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

        // The complete allowed transitions map (mirrors the production code)
        private static readonly Dictionary<long, HashSet<long>> AllowedTransitions = new()
        {
            [AppointmentStateMachine.STATUS_PENDIENTE_PAGO] = new() { AppointmentStateMachine.STATUS_CONFIRMADA, AppointmentStateMachine.STATUS_CANCELADA },
            [AppointmentStateMachine.STATUS_CONFIRMADA] = new() { AppointmentStateMachine.STATUS_PACIENTE_PRESENTE, AppointmentStateMachine.STATUS_NO_ASISTIO, AppointmentStateMachine.STATUS_CANCELADA },
            [AppointmentStateMachine.STATUS_PACIENTE_PRESENTE] = new() { AppointmentStateMachine.STATUS_SIGNOS_VITALES, AppointmentStateMachine.STATUS_NO_ASISTIO, AppointmentStateMachine.STATUS_CANCELADA },
            [AppointmentStateMachine.STATUS_SIGNOS_VITALES] = new() { AppointmentStateMachine.STATUS_EN_ESPERA },
            [AppointmentStateMachine.STATUS_EN_ESPERA] = new() { AppointmentStateMachine.STATUS_CONSULTA_MEDICA, AppointmentStateMachine.STATUS_EVALUADO, AppointmentStateMachine.STATUS_NO_ASISTIO },
            [AppointmentStateMachine.STATUS_CONSULTA_MEDICA] = new() { AppointmentStateMachine.STATUS_EVALUADO },
            [AppointmentStateMachine.STATUS_EVALUADO] = new() { AppointmentStateMachine.STATUS_LABORATORIO, AppointmentStateMachine.STATUS_FARMACIA, AppointmentStateMachine.STATUS_ATENCION_FINAL },
            [AppointmentStateMachine.STATUS_LABORATORIO] = new() { AppointmentStateMachine.STATUS_FARMACIA, AppointmentStateMachine.STATUS_ATENCION_FINAL },
            [AppointmentStateMachine.STATUS_FARMACIA] = new() { AppointmentStateMachine.STATUS_ATENCION_FINAL },
            [AppointmentStateMachine.STATUS_ATENCION_FINAL] = new(),
            [AppointmentStateMachine.STATUS_NO_ASISTIO] = new(),
            [AppointmentStateMachine.STATUS_CANCELADA] = new(),
        };

        public AppointmentStateMachinePropertyTests()
        {
            _sut = new AppointmentStateMachine(DbContext);
        }

        #region Custom Generators

        /// <summary>
        /// Generates a random pair of status IDs that is NOT in the allowed transitions map.
        /// </summary>
        private static Arbitrary<(long From, long To)> InvalidTransitionPairArbitrary()
        {
            var gen = from fromIdx in Gen.Choose(0, AllStatusIds.Length - 1)
                      from toIdx in Gen.Choose(0, AllStatusIds.Length - 1)
                      let fromId = AllStatusIds[fromIdx]
                      let toId = AllStatusIds[toIdx]
                      where !IsValidTransition(fromId, toId)
                      select (fromId, toId);

            return Arb.From(gen);
        }

        /// <summary>
        /// Generates a random valid transition pair from the allowed transitions map.
        /// </summary>
        private static Arbitrary<(long From, long To)> ValidTransitionPairArbitrary()
        {
            // Build a flat list of all valid (from, to) pairs
            var validPairs = AllowedTransitions
                .SelectMany(kvp => kvp.Value.Select(to => (From: kvp.Key, To: to)))
                .ToList();

            var gen = Gen.Elements(validPairs.ToArray());
            return Arb.From(gen);
        }

        /// <summary>
        /// Generates a positive long for user IDs.
        /// </summary>
        private static Arbitrary<long> PositiveLongArbitrary()
        {
            var gen = Gen.Choose(1, 10000).Select(i => (long)i);
            return Arb.From(gen);
        }

        private static bool IsValidTransition(long from, long to)
        {
            return AllowedTransitions.TryGetValue(from, out var allowed)
                && allowed.Contains(to);
        }

        #endregion

        #region Property 4: Invalid transitions are rejected

        /// <summary>
        /// Property 4: For any pair of status IDs (fromStatusId, toStatusId) where the pair
        /// is NOT present in the _allowedTransitions map, CanTransition(fromStatusId, toStatusId)
        /// SHALL return false.
        /// Validates: Requirements 5.2, 5.3, 5.7
        /// </summary>
        [Property(MaxTest = 100)]
        public Property InvalidTransitions_AreRejected_ByCanTransition()
        {
            return Prop.ForAll(
                InvalidTransitionPairArbitrary(),
                pair =>
                {
                    var result = _sut.CanTransition(pair.From, pair.To);
                    return result == false;
                });
        }

        /// <summary>
        /// Property 4 (continued): For any invalid transition pair, TransitionAsync SHALL return
        /// (false, error message) without modifying the appointment's AppointmentStatusId.
        /// Validates: Requirements 5.2, 5.3, 5.7
        /// </summary>
        [Property(MaxTest = 100)]
        public Property InvalidTransitions_AreRejected_ByTransitionAsync()
        {
            return Prop.ForAll(
                InvalidTransitionPairArbitrary(),
                PositiveLongArbitrary(),
                (pair, updatedBy) =>
                {
                    // Each property test iteration needs its own DB context for isolation
                    using var testBase = new IsolatedTestContext();
                    var sut = new AppointmentStateMachine(testBase.Context);

                    // Arrange: create an active appointment with the 'from' status
                    var appointment = new Appointment
                    {
                        Id = 1,
                        AppointmentStatusId = pair.From,
                        State = 1,
                        PatientId = 1,
                        SpecialtyId = 1,
                        BranchId = 1,
                        AppointmentDate = DateTime.UtcNow.AddDays(1),
                        Reason = "Property test appointment",
                        CreatedAt = DateTime.UtcNow.AddHours(-1),
                        CreatedBy = 1,
                    };

                    testBase.Context.Appointments.Add(appointment);

                    // Add status entries for name resolution
                    testBase.Context.AppointmentStatuses.Add(new AppointmentStatus
                    {
                        Id = pair.From,
                        Name = $"Status_{pair.From}",
                        State = 1,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = 1
                    });

                    if (pair.From != pair.To)
                    {
                        testBase.Context.AppointmentStatuses.Add(new AppointmentStatus
                        {
                            Id = pair.To,
                            Name = $"Status_{pair.To}",
                            State = 1,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = 1
                        });
                    }

                    testBase.Context.SaveChanges();

                    // Act
                    var (success, error) = sut.TransitionAsync(1, pair.To, updatedBy).GetAwaiter().GetResult();

                    // Assert: transition should fail
                    var transitionFailed = success == false;
                    var errorMessagePresent = !string.IsNullOrEmpty(error);

                    // Assert: status should remain unchanged
                    var unchangedAppointment = testBase.Context.Appointments.Find(1L);
                    var statusUnchanged = unchangedAppointment!.AppointmentStatusId == pair.From;

                    return transitionFailed && errorMessagePresent && statusUnchanged;
                });
        }

        #endregion

        #region Property 5: Valid transitions succeed

        /// <summary>
        /// Property 5: For any active appointment (State == 1) and any valid transition pair
        /// present in _allowedTransitions, calling TransitionAsync SHALL update the appointment's
        /// AppointmentStatusId to the target status, set UpdatedAt to a recent UTC time, and
        /// set UpdatedBy to the provided user ID.
        /// Validates: Requirements 5.5
        /// </summary>
        [Property(MaxTest = 100)]
        public Property ValidTransitions_Succeed_AndUpdateAppointment()
        {
            return Prop.ForAll(
                ValidTransitionPairArbitrary(),
                PositiveLongArbitrary(),
                (pair, updatedBy) =>
                {
                    // Each property test iteration needs its own DB context for isolation
                    using var testBase = new IsolatedTestContext();
                    var sut = new AppointmentStateMachine(testBase.Context);

                    var beforeTransition = DateTime.UtcNow;

                    // Arrange: create an active appointment with the 'from' status
                    var appointment = new Appointment
                    {
                        Id = 1,
                        AppointmentStatusId = pair.From,
                        State = 1,
                        PatientId = 1,
                        SpecialtyId = 1,
                        BranchId = 1,
                        AppointmentDate = DateTime.UtcNow.AddDays(1),
                        Reason = "Property test appointment",
                        CreatedAt = DateTime.UtcNow.AddHours(-1),
                        CreatedBy = 1,
                    };

                    testBase.Context.Appointments.Add(appointment);

                    // Add status entries for name resolution
                    testBase.Context.AppointmentStatuses.Add(new AppointmentStatus
                    {
                        Id = pair.From,
                        Name = $"Status_{pair.From}",
                        State = 1,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = 1
                    });

                    if (pair.From != pair.To)
                    {
                        testBase.Context.AppointmentStatuses.Add(new AppointmentStatus
                        {
                            Id = pair.To,
                            Name = $"Status_{pair.To}",
                            State = 1,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = 1
                        });
                    }

                    testBase.Context.SaveChanges();

                    // Act
                    var (success, error) = sut.TransitionAsync(1, pair.To, updatedBy).GetAwaiter().GetResult();

                    // Assert
                    var transitionSucceeded = success == true;
                    var noError = error == null;

                    var updatedAppointment = testBase.Context.Appointments.Find(1L);
                    var statusUpdated = updatedAppointment!.AppointmentStatusId == pair.To;
                    var updatedBySet = updatedAppointment.UpdatedBy == updatedBy;
                    var updatedAtSet = updatedAppointment.UpdatedAt != null
                        && updatedAppointment.UpdatedAt.Value >= beforeTransition;

                    return transitionSucceeded && noError && statusUpdated && updatedBySet && updatedAtSet;
                });
        }

        #endregion

        #region Helper: Isolated DB Context for Property Tests

        /// <summary>
        /// Provides an isolated DataContext per property test iteration to avoid
        /// shared state between FsCheck iterations.
        /// </summary>
        private sealed class IsolatedTestContext : IDisposable
        {
            public DataContext Context { get; }

            public IsolatedTestContext()
            {
                var options = new DbContextOptionsBuilder<DataContext>()
                    .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                    .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                    .Options;

                Context = new DataContext(options);
            }

            public void Dispose()
            {
                Context.Dispose();
            }
        }

        #endregion
    }
}
