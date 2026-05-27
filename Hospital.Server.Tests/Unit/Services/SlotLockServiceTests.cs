using FluentAssertions;
using Hospital.Server.Services.Core;
using Xunit;

namespace Hospital.Server.Tests.Unit.Services
{
    public class SlotLockServiceTests : IDisposable
    {
        private readonly SlotLockService _sut;
        private readonly long _doctorId = 1;
        private readonly DateOnly _date = new(2025, 7, 15);
        private readonly TimeOnly _time = new(9, 0);
        private readonly long _patientId = 100;
        private readonly string _connectionId = "conn-abc-123";

        public SlotLockServiceTests()
        {
            _sut = new SlotLockService();
            // Clean up any locks from previous tests (static dictionary)
            _sut.ReleaseAllByConnection(_connectionId);
            _sut.ReleaseAllByConnection("conn-other-456");
            _sut.ReleaseAllByConnection("conn-third-789");
        }

        public void Dispose()
        {
            // Clean up after each test
            _sut.ReleaseAllByConnection(_connectionId);
            _sut.ReleaseAllByConnection("conn-other-456");
            _sut.ReleaseAllByConnection("conn-third-789");
            GC.SuppressFinalize(this);
        }

        #region TryLockSlot

        [Fact]
        public void TryLockSlot_WhenSlotIsFree_ShouldReturnSuccess()
        {
            // Act
            var result = _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Assert
            result.Success.Should().BeTrue();
            result.Reason.Should().BeNull();
            result.LockInfo.Should().NotBeNull();
            result.LockInfo!.DoctorId.Should().Be(_doctorId);
            result.LockInfo.Date.Should().Be("2025-07-15");
            result.LockInfo.Time.Should().Be("09:00");
            result.ReleasedPrevious.Should().BeNull();
        }

        [Fact]
        public void TryLockSlot_WhenSlotLockedByAnotherConnection_ShouldReturnFailure()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Act
            var result = _sut.TryLockSlot(_doctorId, _date, _time, 200, "conn-other-456");

            // Assert
            result.Success.Should().BeFalse();
            result.Reason.Should().NotBeNullOrEmpty();
            result.LockInfo.Should().BeNull();
        }

        [Fact]
        public void TryLockSlot_WhenSameConnectionRelocks_ShouldReturnSuccess()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Act - same connection re-locks the same slot
            var result = _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Assert
            result.Success.Should().BeTrue();
            result.LockInfo.Should().NotBeNull();
        }

        [Fact]
        public void TryLockSlot_WhenConnectionHasPreviousLockForSameDoctorDate_ShouldReleasePrevious()
        {
            // Arrange - lock at 09:00
            _sut.TryLockSlot(_doctorId, _date, new TimeOnly(9, 0), _patientId, _connectionId);

            // Act - lock at 10:00 with same connection (same doctor+date)
            var result = _sut.TryLockSlot(_doctorId, _date, new TimeOnly(10, 0), _patientId, _connectionId);

            // Assert
            result.Success.Should().BeTrue();
            result.ReleasedPrevious.Should().NotBeNull();
            result.ReleasedPrevious!.Time.Should().Be("09:00");
        }

        [Fact]
        public void TryLockSlot_WhenConnectionHasLockForDifferentDoctor_ShouldNotReleasePrevious()
        {
            // Arrange - lock for doctor 1
            _sut.TryLockSlot(1, _date, _time, _patientId, _connectionId);

            // Act - lock for doctor 2 (different doctor, same connection)
            var result = _sut.TryLockSlot(2, _date, _time, _patientId, _connectionId);

            // Assert
            result.Success.Should().BeTrue();
            result.ReleasedPrevious.Should().BeNull();
        }

        [Fact]
        public void TryLockSlot_WhenConnectionHasLockForDifferentDate_ShouldNotReleasePrevious()
        {
            // Arrange - lock for date 2025-07-15
            _sut.TryLockSlot(_doctorId, new DateOnly(2025, 7, 15), _time, _patientId, _connectionId);

            // Act - lock for date 2025-07-16 (different date, same connection)
            var result = _sut.TryLockSlot(_doctorId, new DateOnly(2025, 7, 16), _time, _patientId, _connectionId);

            // Assert
            result.Success.Should().BeTrue();
            result.ReleasedPrevious.Should().BeNull();
        }

        #endregion

        #region ReleaseSlot

        [Fact]
        public void ReleaseSlot_WhenPatientOwnsLock_ShouldReturnTrue()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Act
            var result = _sut.ReleaseSlot(_doctorId, _date, _time, _patientId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void ReleaseSlot_WhenPatientDoesNotOwnLock_ShouldReturnFalse()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Act - different patient tries to release
            var result = _sut.ReleaseSlot(_doctorId, _date, _time, 999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void ReleaseSlot_WhenSlotDoesNotExist_ShouldReturnFalse()
        {
            // Act
            var result = _sut.ReleaseSlot(_doctorId, _date, _time, _patientId);

            // Assert
            result.Should().BeFalse();
        }

        #endregion

        #region ReleaseAllByConnection

        [Fact]
        public void ReleaseAllByConnection_WhenConnectionHasLocks_ShouldReleaseAll()
        {
            // Arrange - create multiple locks for same connection
            _sut.TryLockSlot(1, _date, new TimeOnly(9, 0), _patientId, _connectionId);
            _sut.TryLockSlot(2, _date, new TimeOnly(10, 0), _patientId, _connectionId);

            // Act
            var released = _sut.ReleaseAllByConnection(_connectionId);

            // Assert
            released.Should().HaveCountGreaterThanOrEqualTo(1);
        }

        [Fact]
        public void ReleaseAllByConnection_WhenConnectionHasNoLocks_ShouldReturnEmptyList()
        {
            // Act
            var released = _sut.ReleaseAllByConnection("non-existent-connection");

            // Assert
            released.Should().BeEmpty();
        }

        [Fact]
        public void ReleaseAllByConnection_ShouldNotAffectOtherConnections()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, new TimeOnly(9, 0), _patientId, _connectionId);
            _sut.TryLockSlot(_doctorId, _date, new TimeOnly(10, 0), 200, "conn-other-456");

            // Act - release only first connection
            _sut.ReleaseAllByConnection(_connectionId);

            // Assert - second connection's lock should still exist
            var ownership = _sut.VerifyLockOwnership(_doctorId, _date, new TimeOnly(10, 0), 200);
            ownership.Should().BeTrue();
        }

        #endregion

        #region CleanExpiredLocks

        [Fact]
        public void CleanExpiredLocks_WhenNoExpiredLocks_ShouldReturnEmptyList()
        {
            // Arrange - create a fresh lock (not expired)
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Act
            var expired = _sut.CleanExpiredLocks();

            // Assert
            expired.Should().BeEmpty();
        }

        [Fact]
        public void CleanExpiredLocks_WhenExpiredLocksExist_ShouldRemoveAndReturnThem()
        {
            // Arrange - inject an expired lock using reflection
            var locksField = typeof(SlotLockService).GetField("_locks",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
            var locks = locksField!.GetValue(null) as System.Collections.Concurrent.ConcurrentDictionary<string, Hospital.Server.Entities.Dtos.SlotLockEntry>;

            var expiredEntry = new Hospital.Server.Entities.Dtos.SlotLockEntry(
                _doctorId, _date, new TimeOnly(11, 0), _patientId, "conn-expired-999",
                DateTime.UtcNow.AddMinutes(-10)); // expired 10 minutes ago

            locks!.TryAdd($"doctor_{_doctorId}_date_{_date:yyyy-MM-dd}_time_11:00", expiredEntry);

            // Act
            var expired = _sut.CleanExpiredLocks();

            // Assert
            expired.Should().HaveCountGreaterThanOrEqualTo(1);
            expired.Should().Contain(l => l.Time == "11:00");

            // Cleanup
            locks.TryRemove($"doctor_{_doctorId}_date_{_date:yyyy-MM-dd}_time_11:00", out _);
        }

        #endregion

        #region VerifyLockOwnership

        [Fact]
        public void VerifyLockOwnership_WhenPatientOwnsActiveLock_ShouldReturnTrue()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Act
            var result = _sut.VerifyLockOwnership(_doctorId, _date, _time, _patientId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void VerifyLockOwnership_WhenDifferentPatient_ShouldReturnFalse()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);

            // Act
            var result = _sut.VerifyLockOwnership(_doctorId, _date, _time, 999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void VerifyLockOwnership_WhenNoLockExists_ShouldReturnFalse()
        {
            // Act
            var result = _sut.VerifyLockOwnership(_doctorId, _date, _time, _patientId);

            // Assert
            result.Should().BeFalse();
        }

        #endregion

        #region GetActiveLocksForGroup

        [Fact]
        public void GetActiveLocksForGroup_WhenActiveLocksExist_ShouldReturnThem()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, _date, new TimeOnly(9, 0), _patientId, _connectionId);
            _sut.TryLockSlot(_doctorId, _date, new TimeOnly(10, 0), 200, "conn-other-456");

            // Act
            var activeLocks = _sut.GetActiveLocksForGroup(_doctorId, _date);

            // Assert
            activeLocks.Should().HaveCount(2);
            activeLocks.Should().AllSatisfy(l => l.DoctorId.Should().Be(_doctorId));
        }

        [Fact]
        public void GetActiveLocksForGroup_WhenNoLocksExist_ShouldReturnEmptyList()
        {
            // Act
            var activeLocks = _sut.GetActiveLocksForGroup(999, _date);

            // Assert
            activeLocks.Should().BeEmpty();
        }

        [Fact]
        public void GetActiveLocksForGroup_ShouldNotReturnLocksForDifferentDoctor()
        {
            // Arrange
            _sut.TryLockSlot(1, _date, _time, _patientId, _connectionId);
            _sut.TryLockSlot(2, _date, _time, 200, "conn-other-456");

            // Act
            var activeLocks = _sut.GetActiveLocksForGroup(1, _date);

            // Assert
            activeLocks.Should().HaveCount(1);
            activeLocks[0].DoctorId.Should().Be(1);
        }

        [Fact]
        public void GetActiveLocksForGroup_ShouldNotReturnLocksForDifferentDate()
        {
            // Arrange
            _sut.TryLockSlot(_doctorId, new DateOnly(2025, 7, 15), _time, _patientId, _connectionId);
            _sut.TryLockSlot(_doctorId, new DateOnly(2025, 7, 16), _time, 200, "conn-other-456");

            // Act
            var activeLocks = _sut.GetActiveLocksForGroup(_doctorId, new DateOnly(2025, 7, 15));

            // Assert
            activeLocks.Should().HaveCount(1);
            activeLocks[0].Date.Should().Be("2025-07-15");
        }

        #endregion

        #region Integration Scenarios

        [Fact]
        public void LockAndRelease_FullCycle_ShouldWorkCorrectly()
        {
            // Lock
            var lockResult = _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);
            lockResult.Success.Should().BeTrue();

            // Verify ownership
            _sut.VerifyLockOwnership(_doctorId, _date, _time, _patientId).Should().BeTrue();

            // Release
            _sut.ReleaseSlot(_doctorId, _date, _time, _patientId).Should().BeTrue();

            // Verify no longer owned
            _sut.VerifyLockOwnership(_doctorId, _date, _time, _patientId).Should().BeFalse();
        }

        [Fact]
        public void AfterRelease_AnotherPatientCanLock_ShouldSucceed()
        {
            // Arrange - first patient locks and releases
            _sut.TryLockSlot(_doctorId, _date, _time, _patientId, _connectionId);
            _sut.ReleaseSlot(_doctorId, _date, _time, _patientId);

            // Act - second patient locks
            var result = _sut.TryLockSlot(_doctorId, _date, _time, 200, "conn-other-456");

            // Assert
            result.Success.Should().BeTrue();
        }

        [Fact]
        public void TryLockSlot_WhenExistingLockIsExpired_ShouldReplaceIt()
        {
            // Arrange - inject an expired lock using reflection
            var locksField = typeof(SlotLockService).GetField("_locks",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
            var locks = locksField!.GetValue(null) as System.Collections.Concurrent.ConcurrentDictionary<string, Hospital.Server.Entities.Dtos.SlotLockEntry>;

            var expiredTime = new TimeOnly(14, 0);
            var expiredEntry = new Hospital.Server.Entities.Dtos.SlotLockEntry(
                _doctorId, _date, expiredTime, 999, "conn-expired-old",
                DateTime.UtcNow.AddMinutes(-10)); // expired 10 minutes ago

            var key = $"doctor_{_doctorId}_date_{_date:yyyy-MM-dd}_time_14:00";
            locks!.TryAdd(key, expiredEntry);

            // Act - new patient tries to lock the same slot
            var result = _sut.TryLockSlot(_doctorId, _date, expiredTime, _patientId, _connectionId);

            // Assert - should succeed because the existing lock is expired
            result.Success.Should().BeTrue();
            result.LockInfo.Should().NotBeNull();

            // Cleanup
            _sut.ReleaseSlot(_doctorId, _date, expiredTime, _patientId);
        }

        [Fact]
        public void VerifyLockOwnership_WhenLockIsExpired_ShouldReturnFalse()
        {
            // Arrange - inject an expired lock using reflection
            var locksField = typeof(SlotLockService).GetField("_locks",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
            var locks = locksField!.GetValue(null) as System.Collections.Concurrent.ConcurrentDictionary<string, Hospital.Server.Entities.Dtos.SlotLockEntry>;

            var expiredTime = new TimeOnly(15, 0);
            var expiredEntry = new Hospital.Server.Entities.Dtos.SlotLockEntry(
                _doctorId, _date, expiredTime, _patientId, _connectionId,
                DateTime.UtcNow.AddMinutes(-5)); // expired 5 minutes ago

            var key = $"doctor_{_doctorId}_date_{_date:yyyy-MM-dd}_time_15:00";
            locks!.TryAdd(key, expiredEntry);

            // Act
            var result = _sut.VerifyLockOwnership(_doctorId, _date, expiredTime, _patientId);

            // Assert - should return false because lock is expired
            result.Should().BeFalse();

            // Cleanup
            locks.TryRemove(key, out _);
        }

        [Fact]
        public void GetActiveLocksForGroup_ShouldNotReturnExpiredLocks()
        {
            // Arrange - add a valid lock
            _sut.TryLockSlot(_doctorId, _date, new TimeOnly(8, 0), _patientId, _connectionId);

            // Inject an expired lock
            var locksField = typeof(SlotLockService).GetField("_locks",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
            var locks = locksField!.GetValue(null) as System.Collections.Concurrent.ConcurrentDictionary<string, Hospital.Server.Entities.Dtos.SlotLockEntry>;

            var expiredTime = new TimeOnly(16, 0);
            var expiredEntry = new Hospital.Server.Entities.Dtos.SlotLockEntry(
                _doctorId, _date, expiredTime, 200, "conn-expired-xyz",
                DateTime.UtcNow.AddMinutes(-5));

            var key = $"doctor_{_doctorId}_date_{_date:yyyy-MM-dd}_time_16:00";
            locks!.TryAdd(key, expiredEntry);

            // Act
            var activeLocks = _sut.GetActiveLocksForGroup(_doctorId, _date);

            // Assert - should only return the non-expired lock
            activeLocks.Should().HaveCount(1);
            activeLocks[0].Time.Should().Be("08:00");

            // Cleanup
            locks.TryRemove(key, out _);
        }

        #endregion
    }
}
