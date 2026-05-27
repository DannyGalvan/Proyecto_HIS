using FluentAssertions;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    public class UtilTests
    {
        #region Test Helpers

        private class SampleEntity
        {
            public long Id { get; set; }
            public string? Name { get; set; }
            public string? Email { get; set; }
            public decimal Price { get; set; }
            public long CategoryId { get; set; }
            public DateTime CreatedAt { get; set; }
            public long CreatedBy { get; set; }
            public string? Password { get; set; }
            public int OrdersQuantity { get; set; }
            public Dictionary<string, decimal>? Metadata { get; set; }
        }

        private class NestedEntity
        {
            public string? Name { get; set; }
            public InnerEntity? Inner { get; set; }
        }

        private class InnerEntity
        {
            public string? Value { get; set; }
            public int Number { get; set; }
        }

        private enum TestEnum
        {
            Active,
            Inactive,
            Pending
        }

        private class EntityWithEnum
        {
            public TestEnum Status { get; set; }
            public TestEnum? NullableStatus { get; set; }
        }

        #endregion

        #region UpdateProperties

        [Fact]
        public void UpdateProperties_ShouldUpdateNonNullProperties()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, Name = "Old", Email = "old@test.com" };
            var updated = new SampleEntity { Id = 1, Name = "New", Email = "new@test.com" };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.Name.Should().Be("New");
            existing.Email.Should().Be("new@test.com");
        }

        [Fact]
        public void UpdateProperties_ShouldNotUpdateNullProperties()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, Name = "Original", Email = "orig@test.com" };
            var updated = new SampleEntity { Id = 1, Name = "Updated", Email = null };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.Name.Should().Be("Updated");
            existing.Email.Should().Be("orig@test.com"); // not updated because null
        }

        [Fact]
        public void UpdateProperties_ShouldNotUpdateId()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, Name = "Test" };
            var updated = new SampleEntity { Id = 999, Name = "New" };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.Id.Should().Be(1); // Id should not change
        }

        [Fact]
        public void UpdateProperties_ShouldNotUpdateCreatedAt()
        {
            // Arrange
            var originalDate = new DateTime(2025, 1, 1);
            var existing = new SampleEntity { Id = 1, CreatedAt = originalDate };
            var updated = new SampleEntity { Id = 1, CreatedAt = new DateTime(2025, 12, 31) };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.CreatedAt.Should().Be(originalDate);
        }

        [Fact]
        public void UpdateProperties_ShouldNotUpdateCreatedBy()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, CreatedBy = 5 };
            var updated = new SampleEntity { Id = 1, CreatedBy = 99 };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.CreatedBy.Should().Be(5);
        }

        [Fact]
        public void UpdateProperties_ShouldNotUpdatePassword()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, Password = "secret123" };
            var updated = new SampleEntity { Id = 1, Password = "newpassword" };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.Password.Should().Be("secret123");
        }

        [Fact]
        public void UpdateProperties_ShouldSkipZeroLongValues()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, CategoryId = 5 };
            var updated = new SampleEntity { Id = 1, CategoryId = 0 };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.CategoryId.Should().Be(5); // 0 is skipped
        }

        [Fact]
        public void UpdateProperties_ShouldSkipZeroDecimalValues()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, Price = 100.50m };
            var updated = new SampleEntity { Id = 1, Price = 0m };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.Price.Should().Be(100.50m);
        }

        [Fact]
        public void UpdateProperties_ShouldSkipEmptyDictionary()
        {
            // Arrange
            var existing = new SampleEntity
            {
                Id = 1,
                Metadata = new Dictionary<string, decimal> { { "key", 1.0m } }
            };
            var updated = new SampleEntity
            {
                Id = 1,
                Metadata = new Dictionary<string, decimal>()
            };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.Metadata.Should().ContainKey("key");
        }

        [Fact]
        public void UpdateProperties_ShouldSkipZeroOrdersQuantity()
        {
            // Arrange
            var existing = new SampleEntity { Id = 1, OrdersQuantity = 10 };
            var updated = new SampleEntity { Id = 1, OrdersQuantity = 0 };

            // Act
            Util.UpdateProperties(existing, updated);

            // Assert
            existing.OrdersQuantity.Should().Be(10);
        }

        #endregion

        #region HasValidId

        [Theory]
        [InlineData(1L, true)]
        [InlineData(100L, true)]
        [InlineData(0L, false)]
        [InlineData(-1L, false)]
        public void HasValidId_WithLong_ShouldValidateCorrectly(long id, bool expected)
        {
            // Act
            var result = Util.HasValidId(id);

            // Assert
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData(1, true)]
        [InlineData(50, true)]
        [InlineData(0, false)]
        [InlineData(-5, false)]
        public void HasValidId_WithInt_ShouldValidateCorrectly(int id, bool expected)
        {
            // Act
            var result = Util.HasValidId(id);

            // Assert
            result.Should().Be(expected);
        }

        [Fact]
        public void HasValidId_WithPositiveDecimal_ShouldReturnTrue()
        {
            // Act
            var result = Util.HasValidId(1.5m);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void HasValidId_WithZeroDecimal_ShouldReturnFalse()
        {
            // Act
            var result = Util.HasValidId(0m);

            // Assert
            result.Should().BeFalse();
        }

        [Theory]
        [InlineData("abc", true)]
        [InlineData("1", true)]
        [InlineData("", false)]
        public void HasValidId_WithString_ShouldValidateCorrectly(string id, bool expected)
        {
            // Act
            var result = Util.HasValidId(id);

            // Assert
            result.Should().Be(expected);
        }

        [Fact]
        public void HasValidId_WithNull_ShouldReturnFalse()
        {
            // Act
            var result = Util.HasValidId<long?>(null);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void HasValidId_WithUnsupportedType_ShouldReturnFalse()
        {
            // Act
            var result = Util.HasValidId(new object());

            // Assert
            result.Should().BeFalse();
        }

        #endregion

        #region SetPropertyValue

        [Fact]
        public void SetPropertyValue_WithStringProperty_ShouldReturnString()
        {
            // Act
            var result = Util.SetPropertyValue(typeof(SampleEntity), "Name", "TestValue");

            // Assert
            ((string)result!).Should().Be("TestValue");
        }

        [Fact]
        public void SetPropertyValue_WithLongProperty_ShouldReturnLong()
        {
            // Act
            var result = Util.SetPropertyValue(typeof(SampleEntity), "CategoryId", "42");

            // Assert
            ((long)result!).Should().Be(42);
        }

        [Fact]
        public void SetPropertyValue_WithDecimalProperty_ShouldReturnDecimal()
        {
            // Act
            var result = Util.SetPropertyValue(typeof(SampleEntity), "Price", "99.99");

            // Assert
            ((decimal)result!).Should().Be(99.99m);
        }

        [Fact]
        public void SetPropertyValue_WithNestedProperty_ShouldResolveCorrectly()
        {
            // Act
            var result = Util.SetPropertyValue(typeof(NestedEntity), "Inner.Value", "Nested");

            // Assert
            ((string)result!).Should().Be("Nested");
        }

        [Fact]
        public void SetPropertyValue_WithInvalidProperty_ShouldReturnNull()
        {
            // Act
            var result = Util.SetPropertyValue(typeof(SampleEntity), "NonExistent", "value");

            // Assert
            ((object?)result).Should().BeNull();
        }

        [Fact]
        public void SetPropertyValue_WithNestedInvalidProperty_ShouldReturnNull()
        {
            // Act
            var result = Util.SetPropertyValue(typeof(NestedEntity), "Inner.NonExistent", "value");

            // Assert
            ((object?)result).Should().BeNull();
        }

        #endregion

        #region ConvertToType

        [Fact]
        public void ConvertToType_WithInt_ShouldConvert()
        {
            // Act
            var result = Util.ConvertToType("123", typeof(int));

            // Assert
            ((int)result!).Should().Be(123);
        }

        [Fact]
        public void ConvertToType_WithNullableIntAndEmptyValue_ShouldReturnNull()
        {
            // Act
            var result = Util.ConvertToType("", typeof(int?));

            // Assert
            ((object?)result).Should().BeNull();
        }

        [Fact]
        public void ConvertToType_WithNullableIntAndValue_ShouldConvert()
        {
            // Act
            var result = Util.ConvertToType("456", typeof(int?));

            // Assert
            ((int)result!).Should().Be(456);
        }

        [Fact]
        public void ConvertToType_WithEnum_ShouldParse()
        {
            // Act
            var result = Util.ConvertToType("Active", typeof(TestEnum));

            // Assert
            ((TestEnum)result!).Should().Be(TestEnum.Active);
        }

        [Fact]
        public void ConvertToType_WithNullableEnum_ShouldParse()
        {
            // Act
            var result = Util.ConvertToType("Inactive", typeof(TestEnum?));

            // Assert
            ((TestEnum)result!).Should().Be(TestEnum.Inactive);
        }

        [Fact]
        public void ConvertToType_WithDateTime_ShouldParseIsoFormat()
        {
            // Act
            var result = Util.ConvertToType("2025-07-15T09:30", typeof(DateTime));

            // Assert
            var date = (DateTime)result!;
            date.Year.Should().Be(2025);
            date.Month.Should().Be(7);
            date.Day.Should().Be(15);
            date.Hour.Should().Be(9);
            date.Minute.Should().Be(30);
        }

        [Fact]
        public void ConvertToType_WithDateTimeFullFormat_ShouldParse()
        {
            // Act
            var result = Util.ConvertToType("2025-07-15T09:30:45", typeof(DateTime));

            // Assert
            var date = (DateTime)result!;
            date.Second.Should().Be(45);
        }

        [Fact]
        public void ConvertToType_WithDateOnly_ShouldParse()
        {
            // Act
            var result = Util.ConvertToType("2025-07-15", typeof(DateTime));

            // Assert
            var date = (DateTime)result!;
            date.Year.Should().Be(2025);
            date.Month.Should().Be(7);
            date.Day.Should().Be(15);
        }

        [Fact]
        public void ConvertToType_WithDateTimeHourOnly_ShouldParse()
        {
            // Act
            var result = Util.ConvertToType("2025-07-15T09", typeof(DateTime));

            // Assert
            var date = (DateTime)result!;
            date.Hour.Should().Be(9);
        }

        [Fact]
        public void ConvertToType_WithDateTimeMilliseconds_ShouldParse()
        {
            // Act
            var result = Util.ConvertToType("2025-07-15T09:30:45.123", typeof(DateTime));

            // Assert
            var date = (DateTime)result!;
            date.Millisecond.Should().Be(123);
        }

        [Fact]
        public void ConvertToType_WithInvalidDateTime_ShouldReturnNull()
        {
            // Act
            var result = Util.ConvertToType("not-a-date", typeof(DateTime));

            // Assert
            ((object?)result).Should().BeNull();
        }

        [Fact]
        public void ConvertToType_WithInvalidConversion_ShouldReturnNull()
        {
            // Act
            var result = Util.ConvertToType("not-a-number", typeof(int));

            // Assert
            ((object?)result).Should().BeNull();
        }

        [Fact]
        public void ConvertToType_WithBool_ShouldConvert()
        {
            // Act
            var result = Util.ConvertToType("true", typeof(bool));

            // Assert
            ((bool)result!).Should().BeTrue();
        }

        [Fact]
        public void ConvertToType_WithDouble_ShouldConvert()
        {
            // Act
            var result = Util.ConvertToType("3.14", typeof(double));

            // Assert
            ((double)result!).Should().BeApproximately(3.14, 0.001);
        }

        #endregion

        #region IsCuiValid

        [Fact]
        public void IsCuiValid_WithNull_ShouldReturnFalse()
        {
            // Act
            var result = Util.IsCuiValid(null);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithEmptyString_ShouldReturnFalse()
        {
            // Act
            var result = Util.IsCuiValid("");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithWhitespace_ShouldReturnFalse()
        {
            // Act
            var result = Util.IsCuiValid("   ");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithTooShortString_ShouldReturnFalse()
        {
            // Act
            var result = Util.IsCuiValid("123456");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithTooLongString_ShouldReturnFalse()
        {
            // Act
            var result = Util.IsCuiValid("12345678901234");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithNonNumericCharacters_ShouldReturnFalse()
        {
            // Act
            var result = Util.IsCuiValid("123456789ABCD");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithZeroDepartment_ShouldReturnFalse()
        {
            // Act - department code 00
            var result = Util.IsCuiValid("1234567890001");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithZeroMunicipality_ShouldReturnFalse()
        {
            // Act - municipality code 00
            var result = Util.IsCuiValid("1234567890100");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithDepartmentExceedingMax_ShouldReturnFalse()
        {
            // Act - department 23 (max is 22)
            var result = Util.IsCuiValid("1234567892301");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithMunicipalityExceedingMax_ShouldReturnFalse()
        {
            // Act - department 01 has max 17 municipalities, using 18
            var result = Util.IsCuiValid("1234567890118");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithInvalidVerificationDigit_ShouldReturnFalse()
        {
            // Arrange - valid format but wrong check digit
            // "1234567800101" - department 01, municipality 01, verificador 0
            // The modulo 11 check should fail for this arbitrary number
            var result = Util.IsCuiValid("1234567800101");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsCuiValid_WithSpaces_ShouldRemoveSpacesAndValidate()
        {
            // Arrange - CUI with spaces should be cleaned
            var cuiWithSpaces = "1234 5678 90101";

            // Act - should not throw
            var act = () => Util.IsCuiValid(cuiWithSpaces);

            // Assert - after removing spaces it becomes "1234567890101" which is 13 digits
            act.Should().NotThrow();
        }

        [Fact]
        public void IsCuiValid_WithValidFormatAndCorrectCheckDigit_ShouldReturnTrue()
        {
            // Arrange - We need to construct a CUI that passes the modulo 11 check
            // Department 01 (Guatemala), Municipality 01
            // Number: 19876543, depto: 01, muni: 01
            // Calculate: (1*2)+(9*3)+(8*4)+(7*5)+(6*6)+(5*7)+(4*8)+(3*9) = 2+27+32+35+36+35+32+27 = 226
            // 226 % 11 = 6 (226/11=20 remainder 6)
            // So verificador should be 6
            var result = Util.IsCuiValid("1987654360101");

            // Assert
            result.Should().BeTrue();
        }

        #endregion
    }
}
