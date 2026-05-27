// Feature: unit-integration-test-coverage, Property 6: EntityService Create preserves audit invariants
// Feature: unit-integration-test-coverage, Property 7: EntityService Update preserves CreatedAt
// Feature: unit-integration-test-coverage, Property 8: EntityService GetAll excludes soft-deleted records
// Feature: unit-integration-test-coverage, Property 9: EntityService pagination correctness
// Validates: Requirements 3.1, 3.3, 3.5, 3.9, 3.10

using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using FsCheck;
using FsCheck.Fluent;
using FsCheck.Xunit;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Moq;

namespace Hospital.Server.Tests.Unit.Services
{
    /// <summary>
    /// Property-based tests for EntityService audit invariants.
    /// Uses FsCheck to verify correctness properties across many random inputs.
    /// </summary>
    public class EntityServicePropertyTests
    {
        #region Helpers

        /// <summary>
        /// Creates a fresh in-memory DataContext for each test invocation.
        /// </summary>
        private static DataContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            return new DataContext(options);
        }

        /// <summary>
        /// Creates an EntityService with mocked dependencies and a given DbContext.
        /// Validator passes by default. No interceptors.
        /// </summary>
        private static EntityService<User, UserRequest, long> CreateService(
            DataContext dbContext,
            Mock<IMapper>? mapperMock = null,
            Mock<IFilterTranslator>? filterTranslatorMock = null)
        {
            var mapper = mapperMock ?? new Mock<IMapper>();
            var logger = new Mock<ILogger<EntityService<User, UserRequest, long>>>();
            var filterTranslator = filterTranslatorMock ?? new Mock<IFilterTranslator>();
            var entitySupportService = new Mock<IEntitySupportService>();

            // Setup Create validator to always pass
            var createValidator = new Mock<IValidator<UserRequest>>();
            createValidator.Setup(v => v.Validate(It.IsAny<UserRequest>()))
                .Returns(new ValidationResult());
            entitySupportService.Setup(s => s.GetValidator<UserRequest>("Create"))
                .Returns(createValidator.Object);

            // Setup Update validator to always pass
            var updateValidator = new Mock<IValidator<UserRequest>>();
            updateValidator.Setup(v => v.Validate(It.IsAny<UserRequest>()))
                .Returns(new ValidationResult());
            entitySupportService.Setup(s => s.GetValidator<UserRequest>("Update"))
                .Returns(updateValidator.Object);

            // Setup Partial validator to always pass
            var partialValidator = new Mock<IValidator<UserRequest>>();
            partialValidator.Setup(v => v.Validate(It.IsAny<UserRequest>()))
                .Returns(new ValidationResult());
            entitySupportService.Setup(s => s.GetValidator<UserRequest>("Partial"))
                .Returns(partialValidator.Object);

            // No interceptors
            entitySupportService
                .Setup(s => s.GetBeforeCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeCreateInterceptor<User, UserRequest>>());
            entitySupportService
                .Setup(s => s.GetAfterCreateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterCreateInterceptor<User, UserRequest>>());
            entitySupportService
                .Setup(s => s.GetBeforeUpdateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityBeforeUpdateInterceptor<User, UserRequest>>());
            entitySupportService
                .Setup(s => s.GetAfterUpdateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterUpdateInterceptor<User, UserRequest>>());
            entitySupportService
                .Setup(s => s.GetAfterPartialUpdateInterceptors<User, UserRequest>())
                .Returns(Enumerable.Empty<IEntityAfterPartialUpdateInterceptor<User, UserRequest>>());

            return new EntityService<User, UserRequest, long>(
                mapper.Object,
                logger.Object,
                dbContext,
                filterTranslator.Object,
                entitySupportService.Object
            );
        }

        #endregion

        #region Custom Generators

        /// <summary>
        /// Generates a valid UserRequest for creation with random data.
        /// </summary>
        private static Gen<UserRequest> ValidCreateRequestGen()
        {
            var names = new[] { "Alice", "Bob", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena" };
            var domains = new[] { "test.com", "hospital.gt", "mail.org", "example.net" };

            return
                from name in Gen.Elements(names)
                from domain in Gen.Elements(domains)
                from rolId in Gen.Choose(1, 5).Select(i => (long)i)
                from createdBy in Gen.Choose(1, 100).Select(i => (long)i)
                select new UserRequest
                {
                    Id = null,
                    Name = name,
                    Email = $"{name.ToLower()}@{domain}",
                    UserName = name.ToLower() + rolId,
                    Password = "SecurePass123!",
                    RolId = rolId,
                    CreatedBy = createdBy,
                    State = 1
                };
        }

        /// <summary>
        /// Generates a User entity with random data for seeding the database.
        /// State can be 0 (soft-deleted) or 1 (active).
        /// </summary>
        private static Gen<User> UserEntityGen(long id, int? forcedState = null)
        {
            var names = new[] { "User_A", "User_B", "User_C", "User_D", "User_E", "User_F", "User_G", "User_H" };

            return
                from name in Gen.Elements(names)
                from state in forcedState.HasValue
                    ? Gen.Constant(forcedState.Value)
                    : Gen.Elements([0, 1, 1, 1]) // 75% active, 25% deleted
                from createdBy in Gen.Choose(1, 50).Select(i => (long)i)
                from minutesAgo in Gen.Choose(1, 10000)
                select new User
                {
                    Id = id,
                    Name = $"{name}_{id}",
                    Email = $"{name.ToLower()}_{id}@test.com",
                    UserName = $"{name.ToLower()}{id}",
                    Password = "hashed",
                    RolId = 1,
                    Number = "12345678",
                    IdentificationDocument = "1234567890101",
                    State = state,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-minutesAgo),
                    CreatedBy = createdBy,
                    UpdatedAt = null,
                    UpdatedBy = null
                };
        }

        /// <summary>
        /// Generates a list of User entities with unique IDs and mixed states.
        /// </summary>
        private static Gen<List<User>> UserListGen(int minCount, int maxCount)
        {
            return Gen.Choose(minCount, maxCount).SelectMany(count =>
            {
                // Build the list by chaining generators
                Gen<List<User>> listGen = Gen.Constant(new List<User>());
                for (int i = 1; i <= count; i++)
                {
                    var idx = i;
                    listGen = listGen.SelectMany(list =>
                        UserEntityGen(idx).Select(user =>
                        {
                            list.Add(user);
                            return list;
                        }));
                }
                return listGen;
            });
        }

        /// <summary>
        /// Generates valid pagination parameters.
        /// </summary>
        private static Gen<(int PageNumber, int PageSize)> PaginationGen()
        {
            return
                from pageNumber in Gen.Choose(1, 5)
                from pageSize in Gen.Choose(1, 10)
                select (pageNumber, pageSize);
        }

        #endregion

        #region Property 6: EntityService Create preserves audit invariants

        /// <summary>
        /// Property 6: For any valid create request that passes validation, after EntityService.Create
        /// completes successfully, the persisted entity SHALL have CreatedAt set to approximately
        /// DateTime.UtcNow, UpdatedAt equal to null, and UpdatedBy equal to null.
        /// Validates: Requirements 3.1
        /// </summary>
        [Property(MaxTest = 100)]
        public Property Create_PreservesAuditInvariants_CreatedAtIsUtcNow_UpdatedAtNull_UpdatedByNull()
        {
            var gen =
                from request in ValidCreateRequestGen()
                select request;

            return Prop.ForAll(
                Arb.From(gen),
                request =>
                {
                    using var dbContext = CreateDbContext();

                    var mapperMock = new Mock<IMapper>();
                    mapperMock.Setup(m => m.Map<User>(It.IsAny<UserRequest>()))
                        .Returns((UserRequest r) => new User
                        {
                            Id = 0,
                            Name = r.Name ?? "Test",
                            Email = r.Email ?? "test@test.com",
                            UserName = r.UserName ?? "test",
                            Password = r.Password ?? "pass",
                            RolId = r.RolId ?? 1,
                            Number = "12345678",
                            IdentificationDocument = "1234567890101",
                            State = r.State ?? 1,
                            CreatedBy = r.CreatedBy ?? 1,
                            // Set these to non-null to verify they get overwritten
                            CreatedAt = DateTime.MinValue,
                            UpdatedAt = DateTime.UtcNow,
                            UpdatedBy = 99
                        });

                    var service = CreateService(dbContext, mapperMock);

                    var beforeCreate = DateTime.UtcNow;
                    var response = service.Create(request);
                    var afterCreate = DateTime.UtcNow;

                    // Verify audit invariants
                    if (!response.Success || response.Data == null)
                        return false;

                    var entity = response.Data;

                    var createdAtInRange = entity.CreatedAt >= beforeCreate && entity.CreatedAt <= afterCreate;
                    var updatedAtIsNull = entity.UpdatedAt == null;
                    var updatedByIsNull = entity.UpdatedBy == null;

                    return createdAtInRange && updatedAtIsNull && updatedByIsNull;
                });
        }

        #endregion

        #region Property 7: EntityService Update preserves CreatedAt

        /// <summary>
        /// Property 7: For any valid update request targeting an existing entity, after
        /// EntityService.Update completes successfully, the entity's CreatedAt value SHALL remain
        /// identical to its value before the update, and UpdatedAt SHALL be set to approximately
        /// DateTime.UtcNow.
        /// Validates: Requirements 3.3, 3.5
        /// </summary>
        [Property(MaxTest = 100)]
        public Property Update_PreservesCreatedAt_SetsUpdatedAtToUtcNow()
        {
            var gen =
                from createdBy in Gen.Choose(1, 100).Select(i => (long)i)
                from updatedBy in Gen.Choose(1, 100).Select(i => (long)i)
                from minutesAgo in Gen.Choose(10, 10000)
                from newName in Gen.Elements(["Updated_A", "Updated_B", "Updated_C", "Updated_D"])
                select (createdBy, updatedBy, minutesAgo, newName);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var (createdBy, updatedBy, minutesAgo, newName) = data;

                    using var dbContext = CreateDbContext();

                    // Seed an existing entity with a specific CreatedAt
                    var originalCreatedAt = DateTime.UtcNow.AddMinutes(-minutesAgo);
                    var existingUser = new User
                    {
                        Id = 1,
                        Name = "Original Name",
                        Email = "original@test.com",
                        UserName = "originaluser",
                        Password = "hashed",
                        RolId = 1,
                        Number = "12345678",
                        IdentificationDocument = "1234567890101",
                        State = 1,
                        CreatedAt = originalCreatedAt,
                        CreatedBy = createdBy,
                        UpdatedAt = null,
                        UpdatedBy = null
                    };

                    dbContext.Users.Add(existingUser);
                    dbContext.SaveChanges();
                    dbContext.Entry(existingUser).State = EntityState.Detached;

                    // Create update request
                    var updateRequest = new UserRequest
                    {
                        Id = 1,
                        Name = newName,
                        Email = "original@test.com",
                        UserName = "originaluser",
                        RolId = 1,
                        CreatedBy = createdBy,
                        UpdatedBy = updatedBy,
                        State = 1
                    };

                    var mapperMock = new Mock<IMapper>();
                    mapperMock.Setup(m => m.Map<User>(It.IsAny<UserRequest>()))
                        .Returns((UserRequest r) => new User
                        {
                            Id = r.Id ?? 0,
                            Name = r.Name ?? "Test",
                            Email = r.Email ?? "test@test.com",
                            UserName = r.UserName ?? "test",
                            Password = string.Empty,
                            RolId = r.RolId ?? 1,
                            Number = "12345678",
                            IdentificationDocument = "1234567890101",
                            State = r.State ?? 1,
                            CreatedBy = r.CreatedBy ?? 1,
                            UpdatedBy = r.UpdatedBy,
                            CreatedAt = DateTime.MinValue,
                            UpdatedAt = null
                        });
                    mapperMock.Setup(m => m.Map<User>(It.IsAny<User>()))
                        .Returns((User u) => new User
                        {
                            Id = u.Id,
                            Name = u.Name,
                            Email = u.Email,
                            UserName = u.UserName,
                            Password = u.Password,
                            RolId = u.RolId,
                            Number = u.Number,
                            IdentificationDocument = u.IdentificationDocument,
                            State = u.State,
                            CreatedBy = u.CreatedBy,
                            CreatedAt = u.CreatedAt,
                            UpdatedAt = u.UpdatedAt,
                            UpdatedBy = u.UpdatedBy
                        });

                    var service = CreateService(dbContext, mapperMock);

                    var beforeUpdate = DateTime.UtcNow;
                    var response = service.Update(updateRequest);
                    var afterUpdate = DateTime.UtcNow;

                    if (!response.Success || response.Data == null)
                        return false;

                    var entity = response.Data;

                    // CreatedAt must be preserved (within 1 second tolerance for DateTime precision)
                    var createdAtPreserved = Math.Abs((entity.CreatedAt - originalCreatedAt).TotalSeconds) < 1;
                    var updatedAtInRange = entity.UpdatedAt.HasValue &&
                                           entity.UpdatedAt.Value >= beforeUpdate &&
                                           entity.UpdatedAt.Value <= afterUpdate;

                    return createdAtPreserved && updatedAtInRange;
                });
        }

        #endregion

        #region Property 8: EntityService GetAll excludes soft-deleted records

        /// <summary>
        /// Property 8: For any dataset containing entities with State == 0 (soft-deleted) and
        /// State != 0 (active), calling GetAll with any filter string SHALL never return entities
        /// where State == 0 in the response Data list.
        /// Validates: Requirements 3.9
        /// </summary>
        [Property(MaxTest = 100)]
        public Property GetAll_NeverReturnsSoftDeletedRecords()
        {
            var gen = UserListGen(3, 15);

            return Prop.ForAll(
                Arb.From(gen),
                users =>
                {
                    using var dbContext = CreateDbContext();

                    // Seed the database with the generated users
                    dbContext.Users.AddRange(users);
                    dbContext.SaveChanges();

                    var service = CreateService(dbContext);

                    // Act
                    var response = service.GetAll(filters: null, pageNumber: 1, pageSize: 100);

                    if (!response.Success || response.Data == null)
                        return false;

                    // Assert: no soft-deleted records in results
                    var noDeletedRecords = response.Data.All(u => u.State != 0);

                    // Assert: all active records are present
                    var activeCount = users.Count(u => u.State != 0);
                    var allActiveReturned = response.Data.Count == activeCount;

                    return noDeletedRecords && allActiveReturned;
                });
        }

        #endregion

        #region Property 9: EntityService pagination correctness

        /// <summary>
        /// Property 9: For any dataset of N active entities and pagination parameters
        /// (pageNumber, pageSize) where pageNumber >= 1 and pageSize >= 1, GetAll SHALL return
        /// at most pageSize records, skip exactly (pageNumber - 1) * pageSize records from the
        /// ordered set, and when includeTotal is true, TotalResults SHALL equal the exact count
        /// of matching active entities.
        /// Validates: Requirements 3.10
        /// </summary>
        [Property(MaxTest = 100)]
        public Property GetAll_PaginationReturnsCorrectSubset()
        {
            var gen =
                from pagination in PaginationGen()
                from entityCount in Gen.Choose(1, 20)
                select (pagination, entityCount);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var ((pageNumber, pageSize), entityCount) = data;

                    using var dbContext = CreateDbContext();

                    // Seed only active entities with distinct CreatedAt for deterministic ordering
                    var users = new List<User>();
                    for (int i = 1; i <= entityCount; i++)
                    {
                        users.Add(new User
                        {
                            Id = i,
                            Name = $"User_{i}",
                            Email = $"user{i}@test.com",
                            UserName = $"user{i}",
                            Password = "hashed",
                            RolId = 1,
                            Number = "12345678",
                            IdentificationDocument = "1234567890101",
                            State = 1,
                            CreatedAt = DateTime.UtcNow.AddMinutes(-entityCount + i), // i=entityCount is most recent
                            CreatedBy = 1,
                            UpdatedAt = null,
                            UpdatedBy = null
                        });
                    }

                    dbContext.Users.AddRange(users);
                    dbContext.SaveChanges();

                    var service = CreateService(dbContext);

                    // Act
                    var response = service.GetAll(
                        filters: null,
                        pageNumber: pageNumber,
                        pageSize: pageSize,
                        includeTotal: true);

                    if (!response.Success || response.Data == null)
                        return false;

                    // Calculate expected values
                    int skip = (pageNumber - 1) * pageSize;
                    int expectedCount = Math.Min(pageSize, Math.Max(0, entityCount - skip));

                    // Assert: at most pageSize records returned
                    var atMostPageSize = response.Data.Count <= pageSize;

                    // Assert: correct number of records
                    var correctCount = response.Data.Count == expectedCount;

                    // Assert: TotalResults equals exact count of active entities when includeTotal=true
                    var correctTotal = response.TotalResults == entityCount;

                    return atMostPageSize && correctCount && correctTotal;
                });
        }

        /// <summary>
        /// Property 9 (continued): Verifies that pagination skips the correct number of records
        /// from the ordered set (ordered by CreatedAt descending).
        /// Validates: Requirements 3.10
        /// </summary>
        [Property(MaxTest = 100)]
        public Property GetAll_PaginationSkipsCorrectRecords()
        {
            var gen =
                from pageSize in Gen.Choose(2, 5)
                from entityCount in Gen.Choose(5, 15)
                select (pageSize, entityCount);

            return Prop.ForAll(
                Arb.From(gen),
                data =>
                {
                    var (pageSize, entityCount) = data;

                    using var dbContext = CreateDbContext();

                    // Seed active entities with distinct CreatedAt
                    var users = new List<User>();
                    for (int i = 1; i <= entityCount; i++)
                    {
                        users.Add(new User
                        {
                            Id = i,
                            Name = $"User_{i}",
                            Email = $"user{i}@test.com",
                            UserName = $"user{i}",
                            Password = "hashed",
                            RolId = 1,
                            Number = "12345678",
                            IdentificationDocument = "1234567890101",
                            State = 1,
                            CreatedAt = DateTime.UtcNow.AddMinutes(i), // Higher i = more recent
                            CreatedBy = 1,
                            UpdatedAt = null,
                            UpdatedBy = null
                        });
                    }

                    dbContext.Users.AddRange(users);
                    dbContext.SaveChanges();

                    var service = CreateService(dbContext);

                    // Get page 1 and page 2
                    var page1 = service.GetAll(filters: null, pageNumber: 1, pageSize: pageSize);
                    var page2 = service.GetAll(filters: null, pageNumber: 2, pageSize: pageSize);

                    if (!page1.Success || page1.Data == null || !page2.Success || page2.Data == null)
                        return false;

                    // Page 1 and page 2 should not overlap
                    var page1Ids = page1.Data.Select(u => u.Id).ToHashSet();
                    var page2Ids = page2.Data.Select(u => u.Id).ToHashSet();
                    var noOverlap = !page1Ids.Overlaps(page2Ids);

                    // Page 1 should contain the most recent records (highest CreatedAt)
                    // Since ordered by CreatedAt DESC, page 1 has the highest IDs
                    var page1HasHigherIds = page1.Data.Count == 0 || page2.Data.Count == 0 ||
                        page1.Data.Min(u => u.CreatedAt) >= page2.Data.Max(u => u.CreatedAt);

                    return noOverlap && page1HasHigherIds;
                });
        }

        #endregion
    }
}
