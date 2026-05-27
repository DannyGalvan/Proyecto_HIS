using FluentAssertions;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    public class OrderAttributeTests
    {
        // OrderAttribute is abstract, so we need a concrete implementation for testing
        [AttributeUsage(AttributeTargets.Class)]
        private class TestOrderAttribute : OrderAttribute
        {
            public TestOrderAttribute(int priority) : base(priority) { }
        }

        [Fact]
        public void OrderAttribute_ShouldStorePriority()
        {
            // Arrange & Act
            var attr = new TestOrderAttribute(5);

            // Assert
            attr.Priority.Should().Be(5);
        }

        [Fact]
        public void OrderAttribute_WithZeroPriority_ShouldStoreZero()
        {
            // Arrange & Act
            var attr = new TestOrderAttribute(0);

            // Assert
            attr.Priority.Should().Be(0);
        }

        [Fact]
        public void OrderAttribute_WithNegativePriority_ShouldStoreNegative()
        {
            // Arrange & Act
            var attr = new TestOrderAttribute(-1);

            // Assert
            attr.Priority.Should().Be(-1);
        }

        [Fact]
        public void OrderAttribute_ShouldBeClassAttribute()
        {
            // Assert
            var attrUsage = typeof(OrderAttribute)
                .GetCustomAttributes(typeof(AttributeUsageAttribute), false)
                .FirstOrDefault() as AttributeUsageAttribute;

            attrUsage.Should().NotBeNull();
            attrUsage!.ValidOn.Should().Be(AttributeTargets.Class);
        }
    }
}
