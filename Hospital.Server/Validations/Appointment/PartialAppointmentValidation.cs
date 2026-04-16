using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.Appointment
{
    public class PartialAppointmentValidation : PartialUpdateValidator<AppointmentRequest, long?>
    {
        public PartialAppointmentValidation()
        {
            When(x => x.PatientId != null, () =>
            {
                RuleFor(x => x.PatientId)
                    .GreaterThan(0).WithMessage("El identificador del paciente debe ser válido");
            });

            When(x => x.SpecialtyId != null, () =>
            {
                RuleFor(x => x.SpecialtyId)
                    .GreaterThan(0).WithMessage("El identificador de la especialidad debe ser válido");
            });

            When(x => x.BranchId != null, () =>
            {
                RuleFor(x => x.BranchId)
                    .GreaterThan(0).WithMessage("El identificador de la sucursal debe ser válido");
            });

            When(x => x.AppointmentStatusId != null, () =>
            {
                RuleFor(x => x.AppointmentStatusId)
                    .GreaterThan(0).WithMessage("El identificador del estado debe ser válido");
            });

            When(x => !string.IsNullOrEmpty(x.Reason), () =>
            {
                RuleFor(x => x.Reason)
                    .MinimumLength(10).WithMessage("El motivo debe contener al menos 10 caracteres. Usted ingresó {TotalLength} caracteres")
                    .MaximumLength(2000).WithMessage("El motivo no debe exceder los 2000 caracteres. Usted ingresó {TotalLength} caracteres");
            });

            When(x => x.Amount != null, () =>
            {
                RuleFor(x => x.Amount)
                    .GreaterThanOrEqualTo(0).WithMessage("El monto de la consulta no puede ser negativo");
            });

            When(x => x.Priority != null, () =>
            {
                RuleFor(x => x.Priority)
                    .InclusiveBetween(0, 2).WithMessage("La prioridad debe ser 0 (Normal), 1 (Urgente) o 2 (Emergencia)");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 (Inactivo) o 1 (Activo)");
            });
        }
    }
}
