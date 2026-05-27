using FluentAssertions;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.User;
using Xunit;

namespace Hospital.Server.Tests.Unit.Validators;

/// <summary>
/// Tests for CreateUserValidation entity-specific rules.
/// Validates: Requirements 6.8
/// </summary>
public class UserValidatorTests
{
    private readonly CreateUserValidation _validator = new();

    private static UserRequest CreateValidUserRequest() => new()
    {
        Id = null,
        RolId = 1,
        Email = "test@hospital.com",
        Name = "Juan Pérez",
        UserName = "jperez",
        Password = "SecurePass123",
        State = 1,
        CreatedBy = 1
    };

    #region Email Validation

    [Fact]
    public void CreateUser_WithNullEmail_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Email = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email"
            && e.ErrorMessage == "El Email es requerido");
    }

    [Fact]
    public void CreateUser_WithEmptyEmail_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Email = "";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email"
            && e.ErrorMessage == "El Email no puede ser vacío");
    }

    [Fact]
    public void CreateUser_WithInvalidEmailFormat_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Email = "not-an-email";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email"
            && e.ErrorMessage == "El Email no es válido");
    }

    [Fact]
    public void CreateUser_WithEmailExceeding100Characters_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Email = new string('a', 92) + "@test.com"; // 101 chars total

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email"
            && e.ErrorMessage == "El Email no puede exceder 100 caracteres");
    }

    [Fact]
    public void CreateUser_WithValidEmail_ShouldPass()
    {
        var request = CreateValidUserRequest();
        request.Email = "valid@hospital.com";

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "Email");
    }

    #endregion

    #region Name Validation

    [Fact]
    public void CreateUser_WithNullName_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Name = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name"
            && e.ErrorMessage == "El Nombre es requerido");
    }

    [Fact]
    public void CreateUser_WithEmptyName_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Name = "";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name"
            && e.ErrorMessage == "El Nombre no puede ser vacío");
    }

    [Fact]
    public void CreateUser_WithNameExceeding150Characters_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Name = new string('A', 151);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name"
            && e.ErrorMessage == "El Nombre no puede exceder 150 caracteres");
    }

    #endregion

    #region UserName Validation

    [Fact]
    public void CreateUser_WithNullUserName_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.UserName = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "UserName"
            && e.ErrorMessage == "El Nombre de Usuario es requerido");
    }

    [Fact]
    public void CreateUser_WithUserNameTooShort_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.UserName = "abc";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "UserName"
            && e.ErrorMessage == "El Nombre de Usuario debe tener al menos 4 caracteres");
    }

    [Fact]
    public void CreateUser_WithUserNameExceeding50Characters_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.UserName = new string('u', 51);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "UserName"
            && e.ErrorMessage == "El Nombre de Usuario no puede exceder 50 caracteres");
    }

    #endregion

    #region Password Validation

    [Fact]
    public void CreateUser_WithNullPassword_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Password = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password"
            && e.ErrorMessage == "La Contraseña es requerida");
    }

    [Fact]
    public void CreateUser_WithPasswordTooShort_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Password = "12345";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password"
            && e.ErrorMessage == "La Contraseña debe tener al menos 6 caracteres");
    }

    [Fact]
    public void CreateUser_WithPasswordExceeding100Characters_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Password = new string('p', 101);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password"
            && e.ErrorMessage == "La Contraseña no puede exceder 100 caracteres");
    }

    #endregion

    #region RolId Validation

    [Fact]
    public void CreateUser_WithNullRolId_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.RolId = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RolId"
            && e.ErrorMessage == "El Rol es requerido");
    }

    [Fact]
    public void CreateUser_WithZeroRolId_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.RolId = 0;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RolId"
            && e.ErrorMessage == "El Rol debe ser válido");
    }

    #endregion

    #region State Validation

    [Fact]
    public void CreateUser_WithNullState_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.State = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El Estado es requerido");
    }

    [Fact]
    public void CreateUser_WithInvalidState_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.State = 5;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El Estado debe ser 0 (Inactivo) o 1 (Activo)");
    }

    #endregion

    #region Optional Field Validation

    [Fact]
    public void CreateUser_WithNitInvalidLength_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Nit = "12345"; // too short (min 8)

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Nit");
    }

    [Fact]
    public void CreateUser_WithNitNonAlphanumeric_ShouldFail()
    {
        var request = CreateValidUserRequest();
        request.Nit = "1234567-"; // contains non-alphanumeric

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Nit"
            && e.ErrorMessage == "El NIT debe contener únicamente caracteres alfanuméricos");
    }

    [Fact]
    public void CreateUser_WithValidNit_ShouldPass()
    {
        var request = CreateValidUserRequest();
        request.Nit = "12345678";

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "Nit");
    }

    #endregion

    #region Full Valid Request

    [Fact]
    public void CreateUser_WithAllValidFields_ShouldPass()
    {
        var request = CreateValidUserRequest();

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    #endregion
}
