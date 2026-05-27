using FluentAssertions;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    public class TimeZoneHelperTests
    {
        #region Resolve

        [Fact]
        public void Resolve_WithValidIanaId_ShouldReturnCorrectTimeZone()
        {
            // Act
            var tz = TimeZoneHelper.Resolve("America/Guatemala");

            // Assert
            tz.Should().NotBeNull();
            tz.Id.Should().Contain("Guatemala");
        }

        [Fact]
        public void Resolve_WithNull_ShouldReturnDefaultTimeZone()
        {
            // Act
            var tz = TimeZoneHelper.Resolve(null);

            // Assert
            tz.Should().NotBeNull();
            tz.Id.Should().Contain("Guatemala");
        }

        [Fact]
        public void Resolve_WithEmptyString_ShouldReturnDefaultTimeZone()
        {
            // Act
            var tz = TimeZoneHelper.Resolve("");

            // Assert
            tz.Should().NotBeNull();
            tz.Id.Should().Contain("Guatemala");
        }

        [Fact]
        public void Resolve_WithWhitespace_ShouldReturnDefaultTimeZone()
        {
            // Act
            var tz = TimeZoneHelper.Resolve("   ");

            // Assert
            tz.Should().NotBeNull();
            tz.Id.Should().Contain("Guatemala");
        }

        [Fact]
        public void Resolve_WithInvalidIanaId_ShouldReturnDefaultTimeZone()
        {
            // Act
            var tz = TimeZoneHelper.Resolve("Invalid/Timezone");

            // Assert
            tz.Should().NotBeNull();
            tz.Id.Should().Contain("Guatemala");
        }

        [Fact]
        public void Resolve_WithAnotherValidTimezone_ShouldReturnCorrectTimeZone()
        {
            // Act
            var tz = TimeZoneHelper.Resolve("America/New_York");

            // Assert
            tz.Should().NotBeNull();
            // New York is UTC-5 base offset
            tz.BaseUtcOffset.Should().Be(TimeSpan.FromHours(-5));
        }

        #endregion

        #region ConvertToLocal

        [Fact]
        public void ConvertToLocal_WithGuatemalaTimezone_ShouldConvertCorrectly()
        {
            // Arrange - Guatemala is UTC-6 (no DST)
            var utcDate = new DateTime(2025, 7, 15, 15, 0, 0, DateTimeKind.Utc);

            // Act
            var localDate = TimeZoneHelper.ConvertToLocal(utcDate, "America/Guatemala");

            // Assert - Guatemala is UTC-6
            localDate.Hour.Should().Be(9);
            localDate.Day.Should().Be(15);
        }

        [Fact]
        public void ConvertToLocal_WithNullTimezone_ShouldUseDefault()
        {
            // Arrange
            var utcDate = new DateTime(2025, 1, 1, 12, 0, 0, DateTimeKind.Utc);

            // Act
            var localDate = TimeZoneHelper.ConvertToLocal(utcDate, null);

            // Assert - should use Guatemala (UTC-6)
            localDate.Hour.Should().Be(6);
        }

        [Fact]
        public void ConvertToLocal_ShouldPreserveDate()
        {
            // Arrange
            var utcDate = new DateTime(2025, 3, 20, 3, 0, 0, DateTimeKind.Utc);

            // Act
            var localDate = TimeZoneHelper.ConvertToLocal(utcDate, "America/Guatemala");

            // Assert - 03:00 UTC - 6 = 21:00 previous day
            localDate.Day.Should().Be(19);
            localDate.Hour.Should().Be(21);
        }

        #endregion

        #region FormatForEmail

        [Fact]
        public void FormatForEmail_ShouldContainHrs()
        {
            // Arrange
            var utcDate = new DateTime(2025, 7, 15, 15, 30, 0, DateTimeKind.Utc);

            // Act
            var formatted = TimeZoneHelper.FormatForEmail(utcDate, "America/Guatemala");

            // Assert
            formatted.Should().Contain("hrs");
        }

        [Fact]
        public void FormatForEmail_ShouldContainYear()
        {
            // Arrange
            var utcDate = new DateTime(2025, 7, 15, 15, 30, 0, DateTimeKind.Utc);

            // Act
            var formatted = TimeZoneHelper.FormatForEmail(utcDate, "America/Guatemala");

            // Assert
            formatted.Should().Contain("2025");
        }

        [Fact]
        public void FormatForEmail_ShouldContainDe()
        {
            // Arrange
            var utcDate = new DateTime(2025, 7, 15, 15, 30, 0, DateTimeKind.Utc);

            // Act
            var formatted = TimeZoneHelper.FormatForEmail(utcDate, "America/Guatemala");

            // Assert - format includes "de" between day and month
            formatted.Should().Contain("de");
        }

        [Fact]
        public void FormatForEmail_WithNullTimezone_ShouldUseDefault()
        {
            // Arrange
            var utcDate = new DateTime(2025, 12, 25, 18, 0, 0, DateTimeKind.Utc);

            // Act
            var formatted = TimeZoneHelper.FormatForEmail(utcDate, null);

            // Assert
            formatted.Should().Contain("2025");
            formatted.Should().Contain("hrs");
        }

        [Fact]
        public void FormatForEmail_ShouldContainTimeInHHmmFormat()
        {
            // Arrange - 15:30 UTC -> 09:30 Guatemala
            var utcDate = new DateTime(2025, 7, 15, 15, 30, 0, DateTimeKind.Utc);

            // Act
            var formatted = TimeZoneHelper.FormatForEmail(utcDate, "America/Guatemala");

            // Assert
            formatted.Should().Contain("09:30");
        }

        #endregion

        #region DefaultTimezone Constant

        [Fact]
        public void DefaultTimezone_ShouldBeAmericaGuatemala()
        {
            // Assert
            TimeZoneHelper.DefaultTimezone.Should().Be("America/Guatemala");
        }

        #endregion
    }
}
