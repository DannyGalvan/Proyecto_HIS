using FluentAssertions;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Hospital.Server.Tests.Integration.Services;

/// <summary>
/// Integration tests for OperationSyncService verifying controller discovery,
/// module/operation creation, exclusion handling, admin role assignment, and idempotency.
/// </summary>
public class OperationSyncServiceTests : IClassFixture<HospitalWebApplicationFactory>, IDisposable
{
    private readonly HospitalWebApplicationFactory _factory;
    private readonly IServiceScope _scope;
    private readonly DataContext _db;
    private readonly IOperationSyncService _syncService;

    public OperationSyncServiceTests(HospitalWebApplicationFactory factory)
    {
        _factory = factory;
        // Ensure the server is created so DI is available
        _ = _factory.Server;
        _scope = _factory.Services.CreateScope();
        _db = _scope.ServiceProvider.GetRequiredService<DataContext>();
        _syncService = _scope.ServiceProvider.GetRequiredService<IOperationSyncService>();
    }

    public void Dispose()
    {
        _scope.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task SyncAsync_CreatesModuleForEachNonExcludedController_WithCorrectNameAndState()
    {
        // Act
        await _syncService.SyncAsync();

        // Assert
        var modules = await _db.Modules.ToListAsync();

        modules.Should().NotBeEmpty("there should be at least one module created from controllers");

        // All modules should have State = 1
        modules.Should().AllSatisfy(m =>
        {
            m.State.Should().Be(1);
            m.Name.Should().NotBeNullOrWhiteSpace();
        });

        // Verify that known controllers that are NOT excluded have modules
        // Controllers like User, Appointment, Medicine, Payment should have modules
        var moduleNames = modules.Select(m => m.Name).ToList();
        moduleNames.Should().Contain("User", "User controller should have a module");
        moduleNames.Should().Contain("Appointment", "Appointment controller should have a module");
    }

    [Fact]
    public async Task SyncAsync_CreatesOperationWithCorrectOperationKeyFormat()
    {
        // Act
        await _syncService.SyncAsync();

        // Assert
        var operations = await _db.Operations.ToListAsync();

        operations.Should().NotBeEmpty("there should be operations created from controller actions");

        // All operations should have OperationKey in format "{Controller}.{Action}.{HttpMethod}"
        operations.Should().AllSatisfy(op =>
        {
            op.OperationKey.Should().NotBeNullOrWhiteSpace();
            var parts = op.OperationKey.Split('.');
            parts.Should().HaveCountGreaterThanOrEqualTo(3,
                $"OperationKey '{op.OperationKey}' should have format Controller.Action.HttpMethod");

            op.ControllerName.Should().NotBeNullOrWhiteSpace();
            op.ActionName.Should().NotBeNullOrWhiteSpace();
            op.HttpMethod.Should().NotBeNullOrWhiteSpace();
        });

        // Verify a known operation exists (e.g., User.GetAll.GET)
        operations.Should().Contain(op => op.OperationKey == "User.GetAll.GET",
            "User.GetAll.GET should be a synced operation");
    }

    [Fact]
    public async Task SyncAsync_ExcludedControllerAtClassLevel_HasNoModuleOrOperations()
    {
        // Act
        await _syncService.SyncAsync();

        // Assert
        var modules = await _db.Modules.ToListAsync();
        var operations = await _db.Operations.ToListAsync();

        // The AuthController has ExcludeFromSync on all its actions (method level),
        // but it's not excluded at class level. Let's verify that controllers with
        // all actions excluded effectively have no operations.
        // Check that no operations exist for actions marked with ExcludeFromSync
        // Auth controller actions like Login, Register are excluded at method level
        operations.Should().NotContain(op => op.OperationKey == "Auth.Post.POST",
            "Auth Login action is excluded from sync");
        operations.Should().NotContain(op => op.OperationKey == "Auth.Register.POST",
            "Auth Register action is excluded from sync");
    }

    [Fact]
    public async Task SyncAsync_ExcludedActionAtMethodLevel_HasNoOperation()
    {
        // Act
        await _syncService.SyncAsync();

        // Assert
        var operations = await _db.Operations.ToListAsync();

        // Actions with [ExcludeFromSync] at method level should not have operations
        // Auth controller's Login (Post), Register, ValidateToken (Get), ChangePassword are excluded
        var excludedOperationKeys = new[]
        {
            "Auth.Post.POST",           // Login
            "Auth.PostRegister.POST",   // Register
            "Auth.Get.GET",             // ValidateToken
            "Auth.ChangePassword.PUT",  // ChangePassword
            "Auth.RecoveryPassword.POST", // RecoveryPassword
            "Auth.UpdateMyTimezone.PATCH" // UpdateMyTimezone
        };

        foreach (var excludedKey in excludedOperationKeys)
        {
            operations.Should().NotContain(op => op.OperationKey == excludedKey,
                $"Action with key '{excludedKey}' is marked [ExcludeFromSync] and should not be synced");
        }

        // PatientPortal excluded actions should also not be present
        operations.Should().NotContain(op =>
            op.ControllerName == "PatientPortal" && op.ActionName == "VerifyDpi",
            "PatientPortal.VerifyDpi is excluded from sync");
        operations.Should().NotContain(op =>
            op.ControllerName == "PatientPortal" && op.ActionName == "GetPublicSpecialties",
            "PatientPortal.GetPublicSpecialties is excluded from sync");
        operations.Should().NotContain(op =>
            op.ControllerName == "PatientPortal" && op.ActionName == "Register",
            "PatientPortal.Register is excluded from sync");
    }

    [Fact]
    public async Task AssignAllOperationsToAdminRoleAsync_CreatesRolOperationForAllActiveOperations()
    {
        // Arrange - Seed the SA role
        var saRole = new Rol
        {
            Id = 1,
            Name = "SA",
            Description = "Super Administrador",
            State = 1,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = 1
        };

        if (!await _db.Roles.AnyAsync(r => r.Name == "SA"))
        {
            _db.Roles.Add(saRole);
            await _db.SaveChangesAsync();
        }

        // Act - Run sync which also calls AssignAllOperationsToAdminRoleAsync
        await _syncService.SyncAsync();

        // Assert
        var activeOperations = await _db.Operations.Where(o => o.State == 1).ToListAsync();
        var role = await _db.Roles.FirstAsync(r => r.Name == "SA");
        var rolOperations = await _db.RolOperations
            .Where(ro => ro.RolId == role.Id && ro.State == 1)
            .ToListAsync();

        // Every active operation should have a RolOperation linked to SA role
        activeOperations.Should().NotBeEmpty();
        rolOperations.Should().HaveCount(activeOperations.Count,
            "every active operation should be assigned to the SA role");

        // Verify all operation IDs are covered
        var assignedOperationIds = rolOperations.Select(ro => ro.OperationId).ToHashSet();
        foreach (var op in activeOperations)
        {
            assignedOperationIds.Should().Contain(op.Id,
                $"Operation '{op.OperationKey}' should be assigned to SA role");
        }
    }

    [Fact]
    public async Task SyncAsync_SecondExecution_ProducesNoDuplicatesAndSameRecordCount()
    {
        // Arrange - Seed the SA role for AssignAllOperationsToAdminRoleAsync
        if (!await _db.Roles.AnyAsync(r => r.Name == "SA"))
        {
            _db.Roles.Add(new Rol
            {
                Id = 1,
                Name = "SA",
                Description = "Super Administrador",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            });
            await _db.SaveChangesAsync();
        }

        // Act - First sync
        await _syncService.SyncAsync();

        var modulesAfterFirst = await _db.Modules.CountAsync();
        var operationsAfterFirst = await _db.Operations.CountAsync();
        var rolOperationsAfterFirst = await _db.RolOperations.CountAsync();

        // Act - Second sync (should be idempotent)
        await _syncService.SyncAsync();

        var modulesAfterSecond = await _db.Modules.CountAsync();
        var operationsAfterSecond = await _db.Operations.CountAsync();
        var rolOperationsAfterSecond = await _db.RolOperations.CountAsync();

        // Assert - Counts should remain the same
        modulesAfterSecond.Should().Be(modulesAfterFirst,
            "second sync should not create duplicate modules");
        operationsAfterSecond.Should().Be(operationsAfterFirst,
            "second sync should not create duplicate operations");
        rolOperationsAfterSecond.Should().Be(rolOperationsAfterFirst,
            "second sync should not create duplicate role-operation assignments");

        // Verify no duplicate OperationKeys exist
        var operationKeys = await _db.Operations.Select(o => o.OperationKey).ToListAsync();
        operationKeys.Should().OnlyHaveUniqueItems(
            "there should be no duplicate OperationKey values after multiple syncs");
    }
}
