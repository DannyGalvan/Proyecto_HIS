using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Appointment
{
    public class CreateAppointmentValidation : CreateValidator<AppointmentRequest, long?>
    {
        public CreateAppointmentValidation()
        {
            RuleFor(x => x.PatientId)
                .NotNull().WithMessage("El paciente es obligatorio")
                .GreaterThan(0).WithMessage("El identificador del paciente debe ser válido");

            RuleFor(x => x.SpecialtyId)
                .NotNull().WithMessage("Debe seleccionar una especialidad médica para continuar")
                .GreaterThan(0).WithMessage("El identificador de la especialidad debe ser válido");

            RuleFor(x => x.BranchId)
                .NotNull().WithMessage("Debe seleccionar una sucursal para continuar")
                .GreaterThan(0).WithMessage("El identificador de la sucursal debe ser válido");

            RuleFor(x => x.AppointmentStatusId)
                .NotNull().WithMessage("El estado de la cita es obligatorio")
                .GreaterThan(0).WithMessage("El identificador del estado debe ser válido");

            RuleFor(x => x.AppointmentDate)
                .NotNull().WithMessage("Debe seleccionar una fecha y hora para la cita")
                .GreaterThan(DateTime.UtcNow).WithMessage("Debe seleccionar una fecha y hora futuras. Las citas no pueden agendarse en fechas pasadas o presentes");

            RuleFor(x => x.Reason)
                .NotNull().WithMessage("El motivo de la visita es obligatorio")
                .NotEmpty().WithMessage("El motivo de la visita no puede estar vacío")
                .MinimumLength(10).WithMessage("El motivo debe contener al menos 10 caracteres. Usted ingresó {TotalLength} caracteres")
                .MaximumLength(2000).WithMessage("El motivo no debe exceder los 2000 caracteres. Usted ingresó {TotalLength} caracteres");

            RuleFor(x => x.Amount)
                .NotNull().WithMessage("El monto de la consulta es obligatorio")
                .GreaterThanOrEqualTo(0).WithMessage("El monto de la consulta no puede ser negativo");

            When(x => x.Priority != null, () =>
            {
                RuleFor(x => x.Priority)
                    .InclusiveBetween(0, 2).WithMessage("La prioridad debe ser 0 (Normal), 1 (Urgente) o 2 (Emergencia)");
            });

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es obligatorio")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
        }
    }
}
