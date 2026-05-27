using FluentAssertions;
using Hospital.Server.Entities.Interfaces;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    public class AuditHelperTests
    {
        #region Test Helpers

        private class SimpleRequest : IRequest<long>
        {
            public long Id { get; set; }
            public long? CreatedBy { get; set; }
            public long? UpdatedBy { get; set; }
            public string? Name { get; set; }
        }

        private class ParentRequest : IRequest<long>
        {
            public long Id { get; set; }
            public long? CreatedBy { get; set; }
            public long? UpdatedBy { get; set; }
            public SimpleRequest? Child { get; set; }
            public List<SimpleRequest>? Children { get; set; }
        }

        private class NonRequest
        {
            public string? Name { get; set; }
            public int Value { get; set; }
        }

        private class MixedParent : IRequest<long>
        {
            public long Id { get; set; }
            public long? CreatedBy { get; set; }
            public long? UpdatedBy { get; set; }
            public NonRequest? NonAuditable { get; set; }
            public SimpleRequest? Auditable { get; set; }
        }

        private class CircularRequest : IRequest<long>
        {
            public long Id { get; set; }
            public long? CreatedBy { get; set; }
            public long? UpdatedBy { get; set; }
            public CircularRequest? Self { get; set; }
        }

        #endregion

        #region SetCreatedByRecursive

        [Fact]
        public void SetCreatedByRecursive_WithSimpleRequest_ShouldSetCreatedBy()
        {
            // Arrange
            var request = new SimpleRequest { Name = "Test" };

            // Act
            AuditHelper.SetCreatedByRecursive(request, 42);

            // Assert
            request.CreatedBy.Should().Be(42);
        }

        [Fact]
        public void SetCreatedByRecursive_WithNestedChild_ShouldSetCreatedByRecursively()
        {
            // Arrange
            var request = new ParentRequest
            {
                Child = new SimpleRequest { Name = "Child" }
            };

            // Act
            AuditHelper.SetCreatedByRecursive(request, 10);

            // Assert
            request.CreatedBy.Should().Be(10);
            request.Child!.CreatedBy.Should().Be(10);
        }

        [Fact]
        public void SetCreatedByRecursive_WithCollection_ShouldSetCreatedByOnAllItems()
        {
            // Arrange
            var request = new ParentRequest
            {
                Children = new List<SimpleRequest>
                {
                    new() { Name = "Item1" },
                    new() { Name = "Item2" },
                    new() { Name = "Item3" }
                }
            };

            // Act
            AuditHelper.SetCreatedByRecursive(request, 5);

            // Assert
            request.CreatedBy.Should().Be(5);
            request.Children.Should().AllSatisfy(c => c.CreatedBy.Should().Be(5));
        }

        [Fact]
        public void SetCreatedByRecursive_WithNullObject_ShouldNotThrow()
        {
            // Act & Assert
            var act = () => AuditHelper.SetCreatedByRecursive(null!, 1);
            act.Should().NotThrow();
        }

        [Fact]
        public void SetCreatedByRecursive_WithNonRequestObject_ShouldNotThrow()
        {
            // Arrange
            var obj = new NonRequest { Name = "Test", Value = 5 };

            // Act & Assert
            var act = () => AuditHelper.SetCreatedByRecursive(obj, 1);
            act.Should().NotThrow();
        }

        [Fact]
        public void SetCreatedByRecursive_WithCircularReference_ShouldNotInfiniteLoop()
        {
            // Arrange
            var request = new CircularRequest { Id = 1 };
            request.Self = request; // circular reference

            // Act & Assert - should not stack overflow
            var act = () => AuditHelper.SetCreatedByRecursive(request, 99);
            act.Should().NotThrow();
            request.CreatedBy.Should().Be(99);
        }

        [Fact]
        public void SetCreatedByRecursive_WithMixedChildren_ShouldOnlySetOnIRequestTypes()
        {
            // Arrange
            var request = new MixedParent
            {
                NonAuditable = new NonRequest { Name = "Non" },
                Auditable = new SimpleRequest { Name = "Aud" }
            };

            // Act
            AuditHelper.SetCreatedByRecursive(request, 7);

            // Assert
            request.CreatedBy.Should().Be(7);
            request.Auditable!.CreatedBy.Should().Be(7);
        }

        [Fact]
        public void SetCreatedByRecursive_WithPrimitiveTypes_ShouldNotThrow()
        {
            // Act & Assert - primitives should be skipped
            var act = () => AuditHelper.SetCreatedByRecursive("hello", 1);
            act.Should().NotThrow();
        }

        #endregion

        #region SetUpdatedByRecursive

        [Fact]
        public void SetUpdatedByRecursive_WithSimpleRequest_ShouldSetUpdatedBy()
        {
            // Arrange
            var request = new SimpleRequest { Name = "Test" };

            // Act
            AuditHelper.SetUpdatedByRecursive(request, 42);

            // Assert
            request.UpdatedBy.Should().Be(42);
        }

        [Fact]
        public void SetUpdatedByRecursive_WithNestedChild_ShouldSetUpdatedByRecursively()
        {
            // Arrange
            var request = new ParentRequest
            {
                Child = new SimpleRequest { Name = "Child" }
            };

            // Act
            AuditHelper.SetUpdatedByRecursive(request, 20);

            // Assert
            request.UpdatedBy.Should().Be(20);
            request.Child!.UpdatedBy.Should().Be(20);
        }

        [Fact]
        public void SetUpdatedByRecursive_WithCollection_ShouldSetUpdatedByOnAllItems()
        {
            // Arrange
            var request = new ParentRequest
            {
                Children = new List<SimpleRequest>
                {
                    new() { Name = "A" },
                    new() { Name = "B" }
                }
            };

            // Act
            AuditHelper.SetUpdatedByRecursive(request, 15);

            // Assert
            request.UpdatedBy.Should().Be(15);
            request.Children.Should().AllSatisfy(c => c.UpdatedBy.Should().Be(15));
        }

        [Fact]
        public void SetUpdatedByRecursive_WithNull_ShouldNotThrow()
        {
            // Act & Assert
            var act = () => AuditHelper.SetUpdatedByRecursive(null, 1);
            act.Should().NotThrow();
        }

        [Fact]
        public void SetUpdatedByRecursive_WithNonRequestObject_ShouldNotThrow()
        {
            // Arrange
            var obj = new NonRequest { Name = "Test" };

            // Act & Assert
            var act = () => AuditHelper.SetUpdatedByRecursive(obj, 1);
            act.Should().NotThrow();
        }

        #endregion
    }
}
