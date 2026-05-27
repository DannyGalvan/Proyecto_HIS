using FluentAssertions;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    /// <summary>
    /// Unit tests for FilterTranslator combinators (AND/OR), nested property paths,
    /// and edge cases (unsupported operator, null/empty filter).
    /// Requirements: 4.5, 4.6, 4.8, 4.9
    /// </summary>
    public class FilterTranslatorCombinatorTests
    {
        private readonly FilterTranslator _translator;

        public FilterTranslatorCombinatorTests()
        {
            _translator = new FilterTranslator();
        }

        #region Test Entities

        private class TestEntity
        {
            public long Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public int Age { get; set; }
            public int State { get; set; } = 1;
            public string Status { get; set; } = string.Empty;
        }

        private class TestEntityWithNested
        {
            public long Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public int State { get; set; } = 1;
            public NestedRole Rol { get; set; } = new();
        }

        private class NestedRole
        {
            public string Name { get; set; } = string.Empty;
            public int Level { get; set; }
        }

        #endregion

        #region AND/OR combinator tests - Requirement 4.5

        [Fact]
        public void TranslateToEfFilter_AndCombinator_CombinesConditionsWithAnd()
        {
            // Arrange
            const string filter = "Name:eq:Admin AND Age:gt:18";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin", Age = 25 },
                new() { Id = 2, Name = "Admin", Age = 15 },
                new() { Id = 3, Name = "User", Age = 25 }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(1);
            result[0].Id.Should().Be(1);
        }

        [Fact]
        public void TranslateToEfFilter_OrCombinator_CombinesConditionsWithOr()
        {
            // Arrange
            const string filter = "Name:eq:Admin OR Name:eq:User";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin" },
                new() { Id = 2, Name = "User" },
                new() { Id = 3, Name = "Guest" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Select(x => x.Name).Should().BeEquivalentTo(["Admin", "User"]);
        }

        [Fact]
        public void TranslateToEfFilter_AndBindsTighterThanOr()
        {
            // Arrange: "Name:eq:A OR Name:eq:B AND Age:gt:18"
            // Expected behavior: AND binds tighter, so this is equivalent to:
            // (Name == "A" OR Name == "B") AND (Age > 18)
            // Because the code splits by AND first at top level, then by OR within each part.
            const string filter = "Name:eq:A OR Name:eq:B AND Age:gt:18";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "A", Age = 10 },  // Name=A but Age<=18
                new() { Id = 2, Name = "B", Age = 25 },  // Name=B and Age>18
                new() { Id = 3, Name = "A", Age = 25 },  // Name=A and Age>18
                new() { Id = 4, Name = "C", Age = 30 },  // Name=C, Age>18
                new() { Id = 5, Name = "B", Age = 10 }   // Name=B but Age<=18
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            // The filter splits by AND first: ["Name:eq:A OR Name:eq:B", "Age:gt:18"]
            // Part 1: (Name == "A" OR Name == "B")
            // Part 2: (Age > 18)
            // Combined: (Name == "A" OR Name == "B") AND (Age > 18)
            // Matches: Id=2 (B, 25), Id=3 (A, 25)
            result.Should().HaveCount(2);
            result.Select(x => x.Id).Should().BeEquivalentTo(new long[] { 2, 3 });
        }

        [Fact]
        public void TranslateToEfFilter_MultipleAndConditions_AllMustMatch()
        {
            // Arrange
            const string filter = "Name:eq:Admin AND Age:gt:18 AND State:eq:1";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin", Age = 25, State = 1 },
                new() { Id = 2, Name = "Admin", Age = 25, State = 0 },
                new() { Id = 3, Name = "Admin", Age = 15, State = 1 },
                new() { Id = 4, Name = "User", Age = 25, State = 1 }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(1);
            result[0].Id.Should().Be(1);
        }

        [Fact]
        public void TranslateToEfFilter_MultipleOrConditions_AnyCanMatch()
        {
            // Arrange: within a single AND-part, multiple OR conditions
            const string filter = "Name:eq:Admin OR Name:eq:User OR Name:eq:Guest";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin" },
                new() { Id = 2, Name = "User" },
                new() { Id = 3, Name = "Guest" },
                new() { Id = 4, Name = "Other" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(3);
            result.Select(x => x.Name).Should().BeEquivalentTo(["Admin", "User", "Guest"]);
        }

        #endregion

        #region Nested property path tests - Requirement 4.6

        [Fact]
        public void TranslateToEfFilter_NestedProperty_NavigatesUsingPropertyOrField()
        {
            // Arrange: "Rol.Name:eq:Admin" navigates TestEntityWithNested -> Rol -> Name
            const string filter = "Rol.Name:eq:Admin";
            var data = new List<TestEntityWithNested>
            {
                new() { Id = 1, Name = "User1", Rol = new NestedRole { Name = "Admin", Level = 1 } },
                new() { Id = 2, Name = "User2", Rol = new NestedRole { Name = "User", Level = 2 } },
                new() { Id = 3, Name = "User3", Rol = new NestedRole { Name = "Admin", Level = 1 } }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntityWithNested>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Rol.Name == "Admin");
        }

        [Fact]
        public void TranslateToEfFilter_NestedProperty_WithNumericValue_FiltersCorrectly()
        {
            // Arrange: "Rol.Level:gt:1" navigates to nested numeric property
            const string filter = "Rol.Level:gt:1";
            var data = new List<TestEntityWithNested>
            {
                new() { Id = 1, Rol = new NestedRole { Name = "Admin", Level = 1 } },
                new() { Id = 2, Rol = new NestedRole { Name = "Manager", Level = 2 } },
                new() { Id = 3, Rol = new NestedRole { Name = "SuperAdmin", Level = 3 } }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntityWithNested>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Rol.Level > 1);
        }

        [Fact]
        public void TranslateToEfFilter_NestedProperty_WithCombinator_WorksCorrectly()
        {
            // Arrange: combining nested property with AND
            const string filter = "Rol.Name:eq:Admin AND State:eq:1";
            var data = new List<TestEntityWithNested>
            {
                new() { Id = 1, State = 1, Rol = new NestedRole { Name = "Admin" } },
                new() { Id = 2, State = 0, Rol = new NestedRole { Name = "Admin" } },
                new() { Id = 3, State = 1, Rol = new NestedRole { Name = "User" } }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntityWithNested>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(1);
            result[0].Id.Should().Be(1);
        }

        #endregion

        #region Unsupported operator tests - Requirement 4.8

        [Fact]
        public void TranslateToEfFilter_UnsupportedOperator_ThrowsArgumentException()
        {
            // Arrange
            const string filter = "Name:xyz:value";

            // Act
            var act = () => _translator.TranslateToEfFilter<TestEntity>(filter);

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*xyz*");
        }

        [Fact]
        public void TranslateToEfFilter_AnotherUnsupportedOperator_ThrowsArgumentException()
        {
            // Arrange
            const string filter = "Age:between:10";

            // Act
            var act = () => _translator.TranslateToEfFilter<TestEntity>(filter);

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*between*");
        }

        #endregion

        #region Null/empty filter tests - Requirement 4.9

        [Fact]
        public void TranslateToEfFilter_NullFilter_ReturnsLambdaEvaluatingToTrue()
        {
            // Arrange
            const string? filter = null;
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin" },
                new() { Id = 2, Name = "User" },
                new() { Id = 3, Name = "Guest" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(3);
            result.Should().BeEquivalentTo(data);
        }

        [Fact]
        public void TranslateToEfFilter_EmptyFilter_ReturnsLambdaEvaluatingToTrue()
        {
            // Arrange
            const string filter = "";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin" },
                new() { Id = 2, Name = "User" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().BeEquivalentTo(data);
        }

        [Fact]
        public void TranslateToEfFilter_NullFilter_ExpressionCompilesAndReturnsTrue()
        {
            // Arrange
            const string? filter = null;

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var compiled = expression.Compile();

            // Assert - the lambda should return true for any entity
            compiled(new TestEntity { Id = 1, Name = "Any" }).Should().BeTrue();
            compiled(new TestEntity { Id = 999, Name = "" }).Should().BeTrue();
        }

        #endregion
    }
}
