using FluentAssertions;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Appointment;
using Xunit;

namespace Hospital.Server.Tests.Unit.Validators;

/// <summary>
/// Tests for CreateAppointmentValidation entity-specific rules.
/// Validates: Requirements 6.8
/// </summary>
public class AppointmentValidatorTests
{
    private readonly CreateAppointmentValidation _validator = new();

    private static AppointmentRequest CreateValidAppointmentRequest() => new()
    {
        Id = null,
        PatientId = 1,
        SpecialtyId = 2,
        BranchId = 1,
        AppointmentStatusId = 1,
        AppointmentDate = DateTime.UtcNow.AddDays(1),
        Reason = "Consulta general por dolor de cabeza persistente",
        Amount = 150.00m,
        State = 1,
        CreatedBy = 1
    };

    #region PatientId Validation

    [Fact]
    public void CreateAppointment_WithNullPatientId_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.PatientId = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PatientId"
            && e.ErrorMessage == "El paciente es obligatorio");
    }

    [Fact]
    public void CreateAppointment_WithZeroPatientId_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.PatientId = 0;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PatientId"
            && e.ErrorMessage == "El identificador del paciente debe ser válido");
    }

    #endregion

    #region SpecialtyId Validation

    [Fact]
    public void CreateAppointment_WithNullSpecialtyId_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.SpecialtyId = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "SpecialtyId"
            && e.ErrorMessage == "Debe seleccionar una especialidad médica para continuar");
    }

    [Fact]
    public void CreateAppointment_WithZeroSpecialtyId_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.SpecialtyId = 0;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "SpecialtyId"
            && e.ErrorMessage == "El identificador de la especialidad debe ser válido");
    }

    #endregion

    #region BranchId Validation

    [Fact]
    public void CreateAppointment_WithNullBranchId_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.BranchId = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "BranchId"
            && e.ErrorMessage == "Debe seleccionar una sucursal para continuar");
    }

    #endregion

    #region AppointmentDate Validation

    [Fact]
    public void CreateAppointment_WithNullAppointmentDate_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.AppointmentDate = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "AppointmentDate"
            && e.ErrorMessage == "Debe seleccionar una fecha y hora para la cita");
    }

    [Fact]
    public void CreateAppointment_WithPastDate_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.AppointmentDate = DateTime.UtcNow.AddDays(-1);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "AppointmentDate"
            && e.ErrorMessage.Contains("Debe seleccionar una fecha y hora futuras"));
    }

    [Fact]
    public void CreateAppointment_WithFutureDate_ShouldPass()
    {
        var request = CreateValidAppointmentRequest();
        request.AppointmentDate = DateTime.UtcNow.AddDays(7);

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "AppointmentDate");
    }

    #endregion

    #region Reason Validation

    [Fact]
    public void CreateAppointment_WithNullReason_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.Reason = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Reason"
            && e.ErrorMessage == "El motivo de la visita es obligatorio");
    }

    [Fact]
    public void CreateAppointment_WithEmptyReason_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.Reason = "";

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Reason"
            && e.ErrorMessage == "El motivo de la visita no puede estar vacío");
    }

    [Fact]
    public void CreateAppointment_WithReasonTooShort_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.Reason = "Dolor"; // less than 10 chars

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Reason"
            && e.ErrorMessage.Contains("El motivo debe contener al menos 10 caracteres"));
    }

    [Fact]
    public void CreateAppointment_WithReasonExceeding2000Characters_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.Reason = new string('R', 2001);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Reason"
            && e.ErrorMessage.Contains("El motivo no debe exceder los 2000 caracteres"));
    }

    #endregion

    #region Amount Validation

    [Fact]
    public void CreateAppointment_WithNullAmount_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.Amount = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount"
            && e.ErrorMessage == "El monto de la consulta es obligatorio");
    }

    [Fact]
    public void CreateAppointment_WithNegativeAmount_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.Amount = -10m;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount"
            && e.ErrorMessage == "El monto de la consulta no puede ser negativo");
    }

    [Fact]
    public void CreateAppointment_WithZeroAmount_ShouldPass()
    {
        var request = CreateValidAppointmentRequest();
        request.Amount = 0m;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "Amount");
    }

    #endregion

    #region Priority Validation

    [Fact]
    public void CreateAppointment_WithInvalidPriority_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.Priority = 5;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Priority"
            && e.ErrorMessage == "La prioridad debe ser 0 (Normal), 1 (Urgente) o 2 (Emergencia)");
    }

    [Fact]
    public void CreateAppointment_WithNullPriority_ShouldPass()
    {
        var request = CreateValidAppointmentRequest();
        request.Priority = null;

        var result = _validator.Validate(request);

        result.Errors.Should().NotContain(e => e.PropertyName == "Priority");
    }

    #endregion

    #region State Validation

    [Fact]
    public void CreateAppointment_WithNullState_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.State = null;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El estado es obligatorio");
    }

    [Fact]
    public void CreateAppointment_WithInvalidState_ShouldFail()
    {
        var request = CreateValidAppointmentRequest();
        request.State = 3;

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State"
            && e.ErrorMessage == "El estado debe ser 0 (Inactivo) o 1 (Activo)");
    }

    #endregion

    #region Full Valid Request

    [Fact]
    public void CreateAppointment_WithAllValidFields_ShouldPass()
    {
        var request = CreateValidAppointmentRequest();

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    #endregion
}
