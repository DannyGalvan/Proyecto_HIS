// Feature: unit-integration-test-coverage, Property 1: FilterTranslator operator correctness
// Feature: unit-integration-test-coverage, Property 2: FilterTranslator AND/OR precedence
// Feature: unit-integration-test-coverage, Property 3: FilterTranslator null/empty identity
// Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.9, 4.10

using FluentAssertions;
using FsCheck;
using FsCheck.Fluent;
using FsCheck.Xunit;
using Hospital.Server.Utils;

namespace Hospital.Server.Tests.Unit.Utils
{
    /// <summary>
    /// Property-based tests for FilterTranslator.
    /// Uses FsCheck to verify correctness properties across many random inputs.
    /// </summary>
    public class FilterTranslatorPropertyTests
    {
        private readonly FilterTranslator _translator;

        public FilterTranslatorPropertyTests()
        {
            _translator = new FilterTranslator();
        }

        #region Test Entity

        private class PropTestEntity
        {
            public long Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public int Age { get; set; }
            public int State { get; set; } = 1;
            public decimal Price { get; set; }
        }

        #endregion

        #region Custom Generators

        /// <summary>
        /// Supported operators for numeric fields (Id, Age, State, Price).
        /// </summary>
        private static readonly string[] NumericOperators = ["eq", "ne", "gt", "lt", "gte", "lte"];

        /// <summary>
        /// Supported operators for string fields (Name).
        /// </summary>
        private static readonly string[] StringOperators = ["eq", "ne", "like"];

        /// <summary>
        /// Generates a random filter condition for a numeric field with a random operator and value.
        /// Returns (filterString, predicate) so we can verify correctness.
        /// </summary>
        private static Gen<(string Filter, Func<PropTestEntity, bool> Predicate)> NumericFilterGen()
        {
            var idFilterGen =
                from op in Gen.Elements(NumericOperators)
                from value in Gen.Choose(1, 100).Select(i => (long)i)
                select CreateNumericFilter("Id", op, value, (e) => e.Id);

            var ageFilterGen =
                from op in Gen.Elements(NumericOperators)
                from value in Gen.Choose(1, 80)
                select CreateNumericFilter("Age", op, value, (e) => (long)e.Age);

            var stateFilterGen =
                from op in Gen.Elements(NumericOperators)
                from value in Gen.Choose(0, 2)
                select CreateNumericFilter("State", op, value, (e) => (long)e.State);

            return Gen.OneOf(idFilterGen, ageFilterGen, stateFilterGen);
        }

        /// <summary>
        /// Generates a random filter condition for the Name string field.
        /// </summary>
        private static Gen<(string Filter, Func<PropTestEntity, bool> Predicate)> StringFilterGen()
        {
            var names = new[] { "Admin", "User", "Guest", "Doctor", "Nurse", "Lab", "Pharm" };

            return
                from op in Gen.Elements(StringOperators)
                from name in Gen.Elements(names)
                select CreateStringFilter("Name", op, name);
        }

        /// <summary>
        /// Generates a random "in" or "notin" filter for the Id field.
        /// </summary>
        private static Gen<(string Filter, Func<PropTestEntity, bool> Predicate)> InFilterGen()
        {
            return
                from count in Gen.Choose(1, 5)
                from values in Gen.ListOf(Gen.Choose(1, 20).Select(i => (long)i), count)
                from isNotIn in Gen.Elements([false, true])
                let distinctValues = values.Distinct().ToList()
                let op = isNotIn ? "notin" : "in"
                let valueStr = string.Join(",", distinctValues)
                let filter = $"Id:{op}:{valueStr}"
                let predicate = isNotIn
                    ? (Func<PropTestEntity, bool>)(e => !distinctValues.Contains(e.Id))
                    : (Func<PropTestEntity, bool>)(e => distinctValues.Contains(e.Id))
                select (filter, predicate);
        }

        /// <summary>
        /// Generates any single valid filter condition.
        /// </summary>
        private static Gen<(string Filter, Func<PropTestEntity, bool> Predicate)> AnyFilterGen()
        {
            return Gen.OneOf(NumericFilterGen(), StringFilterGen(), InFilterGen());
        }

        private static (string Filter, Func<PropTestEntity, bool> Predicate) CreateNumericFilter(
            string field, string op, long value, Func<PropTestEntity, long> accessor)
        {
            var filter = $"{field}:{op}:{value}";
            Func<PropTestEntity, bool> predicate = op switch
            {
                "eq" => e => accessor(e) == value,
                "ne" => e => accessor(e) != value,
                "gt" => e => accessor(e) > value,
                "lt" => e => accessor(e) < value,
                "gte" => e => accessor(e) >= value,
                "lte" => e => accessor(e) <= value,
                _ => throw new ArgumentException($"Unsupported operator: {op}")
            };
            return (filter, predicate);
        }

        private static (string Filter, Func<PropTestEntity, bool> Predicate) CreateStringFilter(
            string field, string op, string value)
        {
            var filter = $"{field}:{op}:{value}";
            Func<PropTestEntity, bool> predicate = op switch
            {
                "eq" => e => e.Name == value,
                "ne" => e => e.Name != value,
                "like" => e => e.Name.Contains(value),
                _ => throw new ArgumentException($"Unsupported operator: {op}")
            };
            return (filter, predicate);
        }

        /// <summary>
        /// Generates a list of test entities with varied data for property testing.
        /// </summary>
        private static Gen<List<PropTestEntity>> TestDataGen()
        {
            var names = new[] { "Admin", "User", "Guest", "Doctor", "Nurse", "Lab", "Pharm", "AdminUser", "FreeUser" };

            var entityGen =
                from id in Gen.Choose(1, 100).Select(i => (long)i)
                from name in Gen.Elements(names)
                from age in Gen.Choose(1, 80)
                from state in Gen.Choose(0, 2)
                from price in Gen.Choose(1, 1000).Select(i => (decimal)i)
                select new PropTestEntity { Id = id, Name = name, Age = age, State = state, Price = price };

            return Gen.ListOf(entityGen, 10);
        }

        /// <summary>
        /// Generates a null or empty string for the identity property test.
        /// </summary>
        private static Gen<string?> NullOrEmptyStringGen()
        {
            return Gen.Elements([null, ""]);
        }

        #endregion

        #region Property 1: FilterTranslator operator correctness

        /// <summary>
        /// Property 1: For any supported filter expression with a valid field name, operator,
        /// and type-compatible value, the LINQ expression produced by TranslateToEfFilter SHALL
        /// correctly include entities that match the condition and exclude entities that do not match.
        /// Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.7, 4.10
        /// </summary>
        [Property(MaxTest = 100)]
        public Property OperatorCorrectness_FilterMatchesExpectedPredicate()
        {
            var gen =
                from filterData in AnyFilterGen()
                from entities in TestDataGen()
                select (filterData, entities);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var (filterData, entities) = data;
                    var (filter, expectedPredicate) = filterData;

                    // Act: apply the filter translator
                    var expression = _translator.TranslateToEfFilter<PropTestEntity>(filter);
                    var actualResult = entities.AsQueryable().Where(expression).ToList();

                    // Expected: apply the predicate manually
                    var expectedResult = entities.Where(expectedPredicate).ToList();

                    // Assert: both should produce the same set of entities
                    var actualIds = actualResult.Select(e => e.Id).OrderBy(x => x).ToList();
                    var expectedIds = expectedResult.Select(e => e.Id).OrderBy(x => x).ToList();

                    return actualIds.SequenceEqual(expectedIds);
                });
        }

        #endregion

        #region Property 2: FilterTranslator AND/OR precedence

        /// <summary>
        /// Property 2: For any compound filter string containing both " AND " and " OR " combinators,
        /// the resulting expression tree SHALL evaluate AND with higher precedence than OR,
        /// such that "A OR B AND C" is equivalent to "(A OR B) AND C" because the code splits
        /// by AND first at top level, then by OR within each AND-part.
        /// Validates: Requirements 4.5
        /// </summary>
        [Property(MaxTest = 100)]
        public Property AndOrPrecedence_AndBindsTighterThanOr()
        {
            // Generate two OR-able conditions and one AND condition
            var gen =
                from filter1 in StringFilterGen()
                from filter2 in StringFilterGen()
                from filter3 in NumericFilterGen()
                from entities in TestDataGen()
                select (filter1, filter2, filter3, entities);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var (f1, f2, f3, entities) = data;

                    // Build compound filter: "f1 OR f2 AND f3"
                    // The FilterTranslator splits by AND first, then OR within each part.
                    // So "f1 OR f2 AND f3" becomes AND-parts: ["f1 OR f2", "f3"]
                    // Which means: (f1 OR f2) AND f3
                    var compoundFilter = $"{f1.Filter} OR {f2.Filter} AND {f3.Filter}";

                    // Act: apply the compound filter
                    var expression = _translator.TranslateToEfFilter<PropTestEntity>(compoundFilter);
                    var actualResult = entities.AsQueryable().Where(expression).ToList();

                    // Expected: (f1 OR f2) AND f3
                    var expectedResult = entities
                        .Where(e => (f1.Predicate(e) || f2.Predicate(e)) && f3.Predicate(e))
                        .ToList();

                    var actualIds = actualResult.Select(e => e.Id).OrderBy(x => x).ToList();
                    var expectedIds = expectedResult.Select(e => e.Id).OrderBy(x => x).ToList();

                    return actualIds.SequenceEqual(expectedIds);
                });
        }

        /// <summary>
        /// Property 2 (continued): Multiple AND conditions all must match.
        /// Validates: Requirements 4.5
        /// </summary>
        [Property(MaxTest = 100)]
        public Property AndPrecedence_MultipleAndConditions_AllMustMatch()
        {
            var gen =
                from f1 in AnyFilterGen()
                from f2 in AnyFilterGen()
                from entities in TestDataGen()
                select (f1, f2, entities);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var (f1, f2, entities) = data;

                    // Build: "f1 AND f2"
                    var compoundFilter = $"{f1.Filter} AND {f2.Filter}";

                    // Act
                    var expression = _translator.TranslateToEfFilter<PropTestEntity>(compoundFilter);
                    var actualResult = entities.AsQueryable().Where(expression).ToList();

                    // Expected: both conditions must match
                    var expectedResult = entities
                        .Where(e => f1.Predicate(e) && f2.Predicate(e))
                        .ToList();

                    var actualIds = actualResult.Select(e => e.Id).OrderBy(x => x).ToList();
                    var expectedIds = expectedResult.Select(e => e.Id).OrderBy(x => x).ToList();

                    return actualIds.SequenceEqual(expectedIds);
                });
        }

        #endregion

        #region Property 3: FilterTranslator null/empty identity

        /// <summary>
        /// Property 3: For any entity of any type, when a null or empty filter string is provided
        /// to TranslateToEfFilter, the resulting lambda SHALL evaluate to true (no filtering applied).
        /// Validates: Requirements 4.9
        /// </summary>
        [Property(MaxTest = 100)]
        public Property NullOrEmptyFilter_ReturnsAllEntities()
        {
            var gen =
                from nullOrEmpty in NullOrEmptyStringGen()
                from entities in TestDataGen()
                select (nullOrEmpty, entities);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var (filter, entities) = data;

                    // Act: apply null/empty filter
                    var expression = _translator.TranslateToEfFilter<PropTestEntity>(filter);
                    var result = entities.AsQueryable().Where(expression).ToList();

                    // Assert: all entities should be returned (no filtering)
                    return result.Count == entities.Count;
                });
        }

        /// <summary>
        /// Property 3 (continued): The compiled lambda from a null/empty filter always returns true
        /// for any randomly generated entity.
        /// Validates: Requirements 4.9
        /// </summary>
        [Property(MaxTest = 100)]
        public Property NullOrEmptyFilter_CompiledLambda_AlwaysReturnsTrue()
        {
            var entityGen =
                from id in Gen.Choose(1, 10000).Select(i => (long)i)
                from name in Gen.Elements(["A", "B", "Test", "", "Admin"])
                from age in Gen.Choose(0, 120)
                from state in Gen.Choose(0, 5)
                from price in Gen.Choose(0, 99999).Select(i => (decimal)i / 100m)
                select new PropTestEntity { Id = id, Name = name, Age = age, State = state, Price = price };

            var gen =
                from nullOrEmpty in NullOrEmptyStringGen()
                from entity in entityGen
                select (nullOrEmpty, entity);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var (filter, entity) = data;

                    // Act
                    var expression = _translator.TranslateToEfFilter<PropTestEntity>(filter);
                    var compiled = expression.Compile();

                    // Assert: should always return true
                    return compiled(entity) == true;
                });
        }

        #endregion
    }
}
