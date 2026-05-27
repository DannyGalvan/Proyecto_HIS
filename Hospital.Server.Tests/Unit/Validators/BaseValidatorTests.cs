using FluentAssertions;
using FluentValidation;
using Hospital.Server.Entities.Interfaces;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;
using Xunit;

namespace Hospital.Server.Tests.Unit.Validators;

/// <summary>
/// Test-specific concrete validators that expose only the base validator rules.
/// These allow testing the base validator behavior in isolation.
/// </summary>
public class TestCreateValidator : CreateValidator<UserRequest, long?>
{
    public TestCreateValidator() : base() { }
}

public class TestUpdateValidator : UpdateValidator<UserRequest, long?>
{
    public TestUpdateValidator() : base() { }
}

public class TestPartialUpdateValidator : PartialUpdateValidator<UserRequest, long?>
{
    public TestPartialUpdateValidator() : base() { }
}

/// <summary>
/// Tests for the base validator classes (CreateValidator, UpdateValidator, PartialUpdateValidator).
/// These validators enforce common rules for IRequest entities across all CRUD operations.
/// </summary>
public class BaseValidatorTests
{
    #region CreateValidator Tests

    [Fact]
    public void CreateValidator_WithAllRequiredFieldsAndNullId_ShouldPass()
    {
        // Arrange
        var validator = new TestCreateValidator();
        var request = new UserRequest
        {
            Id = null,
            CreatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateValidator_WithNonNullId_ShouldFail()
    {
        // Arrange
        var validator = new TestCreateValidator();
        var request = new UserRequest
        {
            Id = 5,
            CreatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Id No debes mandarlo al crear una nueva entidad");
    }

    [Fact]
    public void CreateValidator_WithNullCreatedBy_ShouldFail()
    {
        // Arrange
        var validator = new TestCreateValidator();
        var request = new UserRequest
        {
            Id = null,
            CreatedBy = null
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Usuario creador no puede ser nulo");
    }

    [Fact]
    public void CreateValidator_WithZeroCreatedBy_ShouldFail()
    {
        // Arrange
        var validator = new TestCreateValidator();
        var request = new UserRequest
        {
            Id = null,
            CreatedBy = 0
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Usuario creador no puede ser vacío" ||
            e.ErrorMessage == "El Usuario creador no es valido");
    }

    #endregion

    #region UpdateValidator Tests

    [Fact]
    public void UpdateValidator_WithNullId_ShouldFail()
    {
        // Arrange
        var validator = new TestUpdateValidator();
        var request = new UserRequest
        {
            Id = null,
            UpdatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Id no puede ser nulo" ||
            e.ErrorMessage == "El Id no puede ser vacío");
    }

    [Fact]
    public void UpdateValidator_WithZeroId_ShouldFail()
    {
        // Arrange
        var validator = new TestUpdateValidator();
        var request = new UserRequest
        {
            Id = 0,
            UpdatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Id no puede ser vacío" ||
            e.ErrorMessage == "El Id no es valido");
    }

    [Fact]
    public void UpdateValidator_WithNullUpdatedBy_ShouldFail()
    {
        // Arrange
        var validator = new TestUpdateValidator();
        var request = new UserRequest
        {
            Id = 1,
            UpdatedBy = null
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Usuario actualizador no puede ser nulo");
    }

    [Fact]
    public void UpdateValidator_WithZeroUpdatedBy_ShouldFail()
    {
        // Arrange
        var validator = new TestUpdateValidator();
        var request = new UserRequest
        {
            Id = 1,
            UpdatedBy = 0
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Usuario actualizador no puede ser vacío" ||
            e.ErrorMessage == "El Usuario actualizador no es valido");
    }

    [Fact]
    public void UpdateValidator_WithValidIdAndUpdatedByAndNullCreatedBy_ShouldPass()
    {
        // Arrange
        var validator = new TestUpdateValidator();
        var request = new UserRequest
        {
            Id = 1,
            CreatedBy = null,
            UpdatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void UpdateValidator_WithNonNullCreatedBy_ShouldFail()
    {
        // Arrange
        var validator = new TestUpdateValidator();
        var request = new UserRequest
        {
            Id = 1,
            CreatedBy = 5,
            UpdatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Usuario creador no puede ser modificado");
    }

    #endregion

    #region PartialUpdateValidator Tests

    [Fact]
    public void PartialUpdateValidator_WithOnlyIdAndUpdatedBy_ShouldPass()
    {
        // Arrange
        var validator = new TestPartialUpdateValidator();
        var request = new UserRequest
        {
            Id = 1,
            CreatedBy = null,
            UpdatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void PartialUpdateValidator_WithNonNullCreatedBy_ShouldFail()
    {
        // Arrange
        var validator = new TestPartialUpdateValidator();
        var request = new UserRequest
        {
            Id = 1,
            CreatedBy = 5,
            UpdatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Usuario creador no puede ser modificado");
    }

    [Fact]
    public void PartialUpdateValidator_WithNullId_ShouldFail()
    {
        // Arrange
        var validator = new TestPartialUpdateValidator();
        var request = new UserRequest
        {
            Id = null,
            UpdatedBy = 1
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Id de la entidad es requerido" ||
            e.ErrorMessage == "El Id no tiene un formato valido");
    }

    [Fact]
    public void PartialUpdateValidator_WithNullUpdatedBy_ShouldFail()
    {
        // Arrange
        var validator = new TestPartialUpdateValidator();
        var request = new UserRequest
        {
            Id = 1,
            UpdatedBy = null
        };

        // Act
        var result = validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.ErrorMessage == "El Usuario actualizador es requerido");
    }

    #endregion
}
