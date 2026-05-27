using FluentAssertions;
using Hospital.Server.Entities.Models;
using Hospital.Server.Tests.Infrastructure;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    public class QueryableIncludeExtensionTests : TestBase
    {
        [Fact]
        public void ApplyIncludes_WithValidNavigationProperty_ShouldNotThrow()
        {
            // Arrange
            var query = DbContext.Users.AsQueryable();
            var includes = new[] { "Rol" };

            // Act
            var act = () => query.ApplyIncludes(includes).ToList();

            // Assert
            act.Should().NotThrow();
        }

        [Fact]
        public void ApplyIncludes_WithMultipleIncludes_ShouldNotThrow()
        {
            // Arrange
            var query = DbContext.Users.AsQueryable();
            var includes = new[] { "Rol", "Branch" };

            // Act
            var act = () => query.ApplyIncludes(includes).ToList();

            // Assert
            act.Should().NotThrow();
        }

        [Fact]
        public void ApplyIncludes_WithNestedInclude_ShouldNotThrow()
        {
            // Arrange
            var query = DbContext.Set<LabOrder>().AsQueryable();
            var includes = new[] { "Items" };

            // Act
            var act = () => query.ApplyIncludes(includes).ToList();

            // Assert
            act.Should().NotThrow();
        }

        [Fact]
        public void ApplyIncludes_WithInvalidProperty_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var query = DbContext.Users.AsQueryable();
            var includes = new[] { "NonExistentProperty" };

            // Act
            var act = () => query.ApplyIncludes(includes).ToList();

            // Assert
            act.Should().Throw<InvalidOperationException>()
                .WithMessage("*no existe*");
        }

        [Fact]
        public void ApplyIncludes_WithNonNavigationProperty_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var query = DbContext.Users.AsQueryable();
            var includes = new[] { "Name" }; // string property, not a navigation

            // Act
            var act = () => query.ApplyIncludes(includes).ToList();

            // Assert
            act.Should().Throw<InvalidOperationException>()
                .WithMessage("*no es una propiedad de navegación*");
        }

        [Fact]
        public void ApplyIncludes_WithEmptyArray_ShouldReturnQueryUnchanged()
        {
            // Arrange
            var query = DbContext.Users.AsQueryable();
            var includes = Array.Empty<string>();

            // Act
            var result = query.ApplyIncludes(includes);

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public void ApplyIncludes_WithCollectionNavigation_ShouldNotThrow()
        {
            // Arrange
            var query = DbContext.Set<LabOrder>().AsQueryable();
            var includes = new[] { "Items" };

            // Act
            var act = () => query.ApplyIncludes(includes).ToList();

            // Assert
            act.Should().NotThrow();
        }
    }
}
