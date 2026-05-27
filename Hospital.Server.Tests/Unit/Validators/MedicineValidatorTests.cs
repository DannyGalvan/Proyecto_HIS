using FluentAssertions;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Medicine;
using Xunit;

namespace Hospital.Server.Tests.Unit.Validators;

/// <summary>
/// Tests for CreateMedicineValidation entity-specific rules.
/// Validates: Requirements 6.8
/// </summary>
public class MedicineValidatorTests
{
    private readonly CreateMedicineValidation _validator = new();

    private static MedicineRequest CreateValidMedicineRequest() => new()
    {
        Id = null,
        Name = "Paracetamol 500mg",
        Description = "Analgésico y antipirético de uso común",
        DefaultPrice = 25.50m,
        Unit = "Tableta",
        State = 1,
        CreatedBy = 1
    };

    #region Name Validation

    [Fact]
    public void CreateMedicine_WithNullName_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Name = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name"
            && e.ErrorMessage == "El nombre del medicamento es requerido.");
    }

    [Fact]
    public void CreateMedicine_WithEmptyName_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Name = "";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name"
            && e.ErrorMessage == "El nombre del medicamento no puede estar vacío.");
    }

    [Fact]
    public void CreateMedicine_WithNameExceeding200Characters_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Name = new string('M', 201);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name"
            && e.ErrorMessage == "El nombre del medicamento no puede exceder 200 caracteres.");
    }

    #endregion

    #region Description Validation

    [Fact]
    public void CreateMedicine_WithNullDescription_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Description = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description"
            && e.ErrorMessage == "La descripción del medicamento es requerida.");
    }

    [Fact]
    public void CreateMedicine_WithEmptyDescription_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Description = "";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description"
            && e.ErrorMessage == "La descripción del medicamento no puede estar vacía.");
    }

    [Fact]
    public void CreateMedicine_WithDescriptionExceeding500Characters_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Description = new string('D', 501);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description"
            && e.ErrorMessage == "La descripción del medicamento no puede exceder 500 caracteres.");
    }

    #endregion

    #region DefaultPrice Validation

    [Fact]
    public void CreateMedicine_WithNullDefaultPrice_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.DefaultPrice = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DefaultPrice"
            && e.ErrorMessage == "El precio por defecto es requerido.");
    }

    [Fact]
    public void CreateMedicine_WithZeroDefaultPrice_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.DefaultPrice = 0m;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DefaultPrice"
            && e.ErrorMessage == "El precio por defecto debe ser mayor a cero.");
    }

    [Fact]
    public void CreateMedicine_WithNegativeDefaultPrice_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.DefaultPrice = -5m;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DefaultPrice"
            && e.ErrorMessage == "El precio por defecto debe ser mayor a cero.");
    }

    [Fact]
    public void CreateMedicine_WithPositiveDefaultPrice_ShouldPass()
    {
        var request = CreateValidMedicineRequest();
        request.DefaultPrice = 10.99m;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "DefaultPrice");
    }

    #endregion

    #region Unit Validation

    [Fact]
    public void CreateMedicine_WithNullUnit_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Unit = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Unit"
            && e.ErrorMessage == "La unidad de medida es requerida.");
    }

    [Fact]
    public void CreateMedicine_WithEmptyUnit_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Unit = "";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Unit"
            && e.ErrorMessage == "La unidad de medida no puede estar vacía.");
    }

    [Fact]
    public void CreateMedicine_WithUnitExceeding50Characters_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.Unit = new string('U', 51);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Unit"
            && e.ErrorMessage == "La unidad de medida no puede exceder 50 caracteres.");
    }

    #endregion

    #region MinimumStock Validation

    [Fact]
    public void CreateMedicine_WithNegativeMinimumStock_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.MinimumStock = -1;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "MinimumStock"
            && e.ErrorMessage == "El stock mínimo no puede ser negativo.");
    }

    [Fact]
    public void CreateMedicine_WithZeroMinimumStock_ShouldPass()
    {
        var request = CreateValidMedicineRequest();
        request.MinimumStock = 0;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "MinimumStock");
    }

    [Fact]
    public void CreateMedicine_WithNullMinimumStock_ShouldPass()
    {
        var request = CreateValidMedicineRequest();
        request.MinimumStock = null;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "MinimumStock");
    }

    #endregion

    #region State Validation

    [Fact]
    public void CreateMedicine_WithNullState_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.State = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El estado del medicamento es requerido.");
    }

    [Fact]
    public void CreateMedicine_WithInvalidState_ShouldFail()
    {
        var request = CreateValidMedicineRequest();
        request.State = 2;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El estado del medicamento debe ser 0 (inactivo) o 1 (activo).");
    }

    #endregion

    #region Full Valid Request

    [Fact]
    public void CreateMedicine_WithAllValidFields_ShouldPass()
    {
        var request = CreateValidMedicineRequest();

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    #endregion
}
