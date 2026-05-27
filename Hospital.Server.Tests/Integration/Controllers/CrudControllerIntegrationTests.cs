using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Tests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Hospital.Server.Tests.Integration.Controllers;

/// <summary>
/// Integration tests for CrudController endpoints verifying the full HTTP request pipeline
/// including routing, authorization, validation, and response mapping.
/// Uses MedicineController as the concrete CrudController implementation under test.
/// Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
/// </summary>
public class CrudControllerIntegrationTests : IDisposable
{
    private const string BaseUrl = "/api/v1/Medicine";

    private readonly HospitalWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public CrudControllerIntegrationTests()
    {
        _factory = new HospitalWebApplicationFactory();
        _factory.WithOperationKeys(
            "Medicine.GetAll.GET",
            "Medicine.Get.GET",
            "Medicine.Create.POST",
            "Medicine.Update.PUT",
            "Medicine.PartialUpdate.PATCH",
            "Medicine.Delete.DELETE"
        );
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Seeds a medicine entity directly into the in-memory database.
    /// </summary>
    private async Task<Medicine> SeedMedicineAsync(long id = 1, string name = "Acetaminofén")
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DataContext>();

        var medicine = new Medicine
        {
            Id = id,
            Name = name,
            Description = "Analgésico y antipirético",
            DefaultPrice = 25.50m,
            Unit = "tableta",
            IsControlled = false,
            MinimumStock = 10,
            State = 1,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = 1,
            UpdatedAt = null,
            UpdatedBy = null
        };

        db.Medicines.Add(medicine);
        await db.SaveChangesAsync();

        return medicine;
    }

    #region GET with pagination (Requirement 8.1)

    [Fact]
    public async Task GetAll_Authenticated_WithPagination_Returns200WithSuccessAndDataList()
    {
        // Arrange - Seed multiple medicines
        await SeedMedicineAsync(1, "Acetaminofén");
        await SeedMedicineAsync(2, "Ibuprofeno");
        await SeedMedicineAsync(3, "Amoxicilina");

        // Act
        var response = await _client.GetAsync($"{BaseUrl}?PageNumber=1&PageSize=2&IncludeTotal=true");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<Response<List<MedicineResponse>>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();
        body.Data!.Count.Should().BeLessThanOrEqualTo(2);
        body.TotalResults.Should().Be(3);
    }

    #endregion

    #region POST with valid data (Requirement 8.2)

    [Fact]
    public async Task Create_Authenticated_WithValidData_Returns200WithSuccessAndAssignedId()
    {
        // Arrange
        var request = new MedicineRequest
        {
            Name = "Paracetamol",
            Description = "Analgésico de uso común",
            DefaultPrice = 15.00m,
            Unit = "tableta",
            IsControlled = false,
            MinimumStock = 5,
            State = 1,
            CreatedBy = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync(BaseUrl, request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<Response<MedicineResponse>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();
        body.Data!.Id.Should().BeGreaterThan(0);
        body.Data.Name.Should().Be("Paracetamol");
        body.Data.DefaultPrice.Should().Be(15.00m);
    }

    #endregion

    #region Unauthenticated request (Requirement 8.3)

    [Fact]
    public async Task GetAll_Unauthenticated_Returns401Unauthorized()
    {
        // Act - Use ?anonymous query param to simulate unauthenticated request
        var response = await _client.GetAsync($"{BaseUrl}?anonymous");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region PUT with invalid data (Requirement 8.4)

    [Fact]
    public async Task Update_WithInvalidData_Returns400WithValidationFailures()
    {
        // Arrange - Send a PUT request without required fields (no Id, no UpdatedBy)
        var request = new MedicineRequest
        {
            // Missing Id (required for update)
            Name = null, // Required field
            Description = null, // Required field
            DefaultPrice = null, // Required field
            Unit = null, // Required field
            State = null, // Required field
            UpdatedBy = null // Required for update
        };

        // Act
        var response = await _client.PutAsJsonAsync(BaseUrl, request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var body = await response.Content.ReadFromJsonAsync<Response<List<ValidationFailure>>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeFalse();
        body.Data.Should().NotBeNull();
        body.Data!.Should().NotBeEmpty("validation failures should be returned for invalid fields");
    }

    #endregion

    #region DELETE (Requirement 8.5)

    [Fact]
    public async Task Delete_ExistingEntity_Returns200WithSuccessAndEntitySoftDeleted()
    {
        // Arrange
        var medicine = await SeedMedicineAsync(10, "Medicamento a eliminar");

        // Act
        var response = await _client.DeleteAsync($"{BaseUrl}/{medicine.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<Response<MedicineResponse>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();

        // Verify entity is soft-deleted in the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DataContext>();
        var deletedMedicine = await db.Medicines.FindAsync(medicine.Id);
        deletedMedicine.Should().NotBeNull();
        deletedMedicine!.State.Should().Be(0, "entity should be soft-deleted (State = 0)");
    }

    #endregion

    #region PATCH with partial data (Requirement 8.6)

    [Fact]
    public async Task PartialUpdate_WithPartialData_Returns200WithModifiedFieldsUpdated()
    {
        // Arrange - Seed a medicine to partially update
        var medicine = await SeedMedicineAsync(20, "Medicamento Original");

        var request = new MedicineRequest
        {
            Id = medicine.Id,
            Name = "Medicamento Actualizado",
            // Only updating Name, other fields should remain unchanged
            UpdatedBy = 1
        };

        // Act
        var response = await _client.PatchAsJsonAsync(BaseUrl, request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<Response<MedicineResponse>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();

        // Verify modified field is updated
        body.Data!.Name.Should().Be("Medicamento Actualizado");

        // Verify other fields remain unchanged
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DataContext>();
        var updatedMedicine = await db.Medicines.FindAsync(medicine.Id);
        updatedMedicine.Should().NotBeNull();
        updatedMedicine!.Description.Should().Be("Analgésico y antipirético", "unchanged fields should be preserved");
        updatedMedicine.DefaultPrice.Should().Be(25.50m, "unchanged fields should be preserved");
        updatedMedicine.Unit.Should().Be("tableta", "unchanged fields should be preserved");
    }

    #endregion

    #region GET by ID for non-existent entity (Requirement 8.7)

    [Fact]
    public async Task GetById_NonExistentEntity_Returns400WithSuccessFalse()
    {
        // Act - Request an entity that doesn't exist
        var response = await _client.GetAsync($"{BaseUrl}/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var body = await response.Content.ReadFromJsonAsync<Response<List<ValidationFailure>>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeFalse();
    }

    #endregion

    #region Insufficient permissions (Requirement 8.8)

    [Fact]
    public async Task GetAll_WithInsufficientPermissions_Returns403Forbidden()
    {
        // Arrange - Create a factory with NO operation keys (user has no permissions)
        await using var restrictedFactory = new HospitalWebApplicationFactory();
        // Don't call WithOperationKeys - user will have no OperationKey claims
        using var restrictedClient = restrictedFactory.CreateClient();

        // Act
        var response = await restrictedClient.GetAsync(BaseUrl);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion
}
