using FluentAssertions;
using Hospital.Server.Utils;
using Xunit;

namespace Hospital.Server.Tests.Unit.Utils
{
    /// <summary>
    /// Unit tests for FilterTranslator operator expressions.
    /// Tests verify that filter strings produce correct LINQ expressions
    /// by applying them to in-memory collections.
    /// </summary>
    public class FilterTranslatorTests
    {
        private readonly FilterTranslator _translator;

        public FilterTranslatorTests()
        {
            _translator = new FilterTranslator();
        }

        #region Test Entity

        /// <summary>
        /// Simple test entity used for verifying filter expressions.
        /// </summary>
        private class TestEntity
        {
            public long Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public int Age { get; set; }
            public int State { get; set; } = 1;
            public string Status { get; set; } = string.Empty;
            public decimal Price { get; set; }
        }

        #endregion

        #region eq operator tests

        [Fact]
        public void TranslateToEfFilter_EqOperator_ProducesEqualExpression()
        {
            // Arrange
            const string filter = "Name:eq:Admin";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin" },
                new() { Id = 2, Name = "User" },
                new() { Id = 3, Name = "Admin" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Name == "Admin");
        }

        [Fact]
        public void TranslateToEfFilter_EqOperator_WithNumericValue_FiltersCorrectly()
        {
            // Arrange
            const string filter = "Id:eq:2";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "One" },
                new() { Id = 2, Name = "Two" },
                new() { Id = 3, Name = "Three" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(1);
            result[0].Id.Should().Be(2);
        }

        #endregion

        #region ne operator tests

        [Fact]
        public void TranslateToEfFilter_NeOperator_ProducesNotEqualExpression()
        {
            // Arrange
            const string filter = "Status:ne:Inactive";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Status = "Active" },
                new() { Id = 2, Status = "Inactive" },
                new() { Id = 3, Status = "Active" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Status != "Inactive");
        }

        [Fact]
        public void TranslateToEfFilter_NeOperator_WithNumericValue_FiltersCorrectly()
        {
            // Arrange
            const string filter = "State:ne:0";
            var data = new List<TestEntity>
            {
                new() { Id = 1, State = 1 },
                new() { Id = 2, State = 0 },
                new() { Id = 3, State = 1 }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.State != 0);
        }

        #endregion

        #region like operator tests

        [Fact]
        public void TranslateToEfFilter_LikeOperator_ProducesContainsExpression()
        {
            // Arrange
            const string filter = "Name:like:free";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "freedom" },
                new() { Id = 2, Name = "carefree" },
                new() { Id = 3, Name = "Admin" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Name.Contains("free"));
        }

        [Fact]
        public void TranslateToEfFilter_LikeOperator_NoMatch_ReturnsEmpty()
        {
            // Arrange
            const string filter = "Name:like:xyz";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "Admin" },
                new() { Id = 2, Name = "User" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().BeEmpty();
        }

        #endregion

        #region in operator tests

        [Fact]
        public void TranslateToEfFilter_InOperator_ProducesEnumerableContainsExpression()
        {
            // Arrange
            const string filter = "Id:in:1,2,3";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "One" },
                new() { Id = 2, Name = "Two" },
                new() { Id = 3, Name = "Three" },
                new() { Id = 4, Name = "Four" },
                new() { Id = 5, Name = "Five" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(3);
            result.Select(x => x.Id).Should().BeEquivalentTo(new long[] { 1, 2, 3 });
        }

        [Fact]
        public void TranslateToEfFilter_InOperator_WithSingleValue_FiltersCorrectly()
        {
            // Arrange
            const string filter = "Id:in:5";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "One" },
                new() { Id = 5, Name = "Five" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(1);
            result[0].Id.Should().Be(5);
        }

        #endregion

        #region notin operator tests

        [Fact]
        public void TranslateToEfFilter_NotInOperator_ProducesNegatedEnumerableContainsExpression()
        {
            // Arrange
            const string filter = "Id:notin:4,5";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "One" },
                new() { Id = 2, Name = "Two" },
                new() { Id = 3, Name = "Three" },
                new() { Id = 4, Name = "Four" },
                new() { Id = 5, Name = "Five" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(3);
            result.Select(x => x.Id).Should().BeEquivalentTo(new long[] { 1, 2, 3 });
        }

        [Fact]
        public void TranslateToEfFilter_NotInOperator_ExcludesAllMatching()
        {
            // Arrange
            const string filter = "Id:notin:1,2,3,4,5";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Name = "One" },
                new() { Id = 2, Name = "Two" },
                new() { Id = 3, Name = "Three" }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().BeEmpty();
        }

        #endregion

        #region gt operator tests

        [Fact]
        public void TranslateToEfFilter_GtOperator_ProducesGreaterThanExpression()
        {
            // Arrange
            const string filter = "Age:gt:18";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Age = 15 },
                new() { Id = 2, Age = 18 },
                new() { Id = 3, Age = 25 },
                new() { Id = 4, Age = 30 }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Age > 18);
        }

        #endregion

        #region lt operator tests

        [Fact]
        public void TranslateToEfFilter_LtOperator_ProducesLessThanExpression()
        {
            // Arrange
            const string filter = "Age:lt:20";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Age = 15 },
                new() { Id = 2, Age = 18 },
                new() { Id = 3, Age = 20 },
                new() { Id = 4, Age = 30 }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Age < 20);
        }

        #endregion

        #region gte operator tests

        [Fact]
        public void TranslateToEfFilter_GteOperator_ProducesGreaterThanOrEqualExpression()
        {
            // Arrange
            const string filter = "Age:gte:18";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Age = 15 },
                new() { Id = 2, Age = 18 },
                new() { Id = 3, Age = 25 },
                new() { Id = 4, Age = 30 }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(3);
            result.Should().OnlyContain(x => x.Age >= 18);
        }

        #endregion

        #region lte operator tests

        [Fact]
        public void TranslateToEfFilter_LteOperator_ProducesLessThanOrEqualExpression()
        {
            // Arrange
            const string filter = "Age:lte:18";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Age = 15 },
                new() { Id = 2, Age = 18 },
                new() { Id = 3, Age = 25 },
                new() { Id = 4, Age = 30 }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Age <= 18);
        }

        #endregion

        #region Comparison operators with decimal type

        [Fact]
        public void TranslateToEfFilter_GtOperator_WithDecimal_FiltersCorrectly()
        {
            // Arrange
            const string filter = "Price:gt:100";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Price = 50.00m },
                new() { Id = 2, Price = 100.00m },
                new() { Id = 3, Price = 150.00m },
                new() { Id = 4, Price = 200.00m }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Price > 100m);
        }

        [Fact]
        public void TranslateToEfFilter_LteOperator_WithDecimal_FiltersCorrectly()
        {
            // Arrange
            const string filter = "Price:lte:100";
            var data = new List<TestEntity>
            {
                new() { Id = 1, Price = 50.00m },
                new() { Id = 2, Price = 100.00m },
                new() { Id = 3, Price = 150.00m }
            };

            // Act
            var expression = _translator.TranslateToEfFilter<TestEntity>(filter);
            var result = data.AsQueryable().Where(expression).ToList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().OnlyContain(x => x.Price <= 100m);
        }

        #endregion
    }
}
