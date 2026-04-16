using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.VitalSign
{
    /// <summary>
    /// Defines the <see cref="CreateVitalSignValidation" />
    /// </summary>
    public class CreateVitalSignValidation : CreateValidator<VitalSignRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateVitalSignValidation"/> class.
        /// </summary>
        public CreateVitalSignValidation()
        {
            RuleFor(x => x.AppointmentId)
                .NotNull().WithMessage("La cita asociada es obligatoria")
                .GreaterThan(0).WithMessage("La cita asociada debe ser mayor a 0");

            RuleFor(x => x.NurseId)
                .NotNull().WithMessage("El enfermero es obligatorio")
                .GreaterThan(0).WithMessage("El enfermero debe ser mayor a 0");

            RuleFor(x => x.BloodPressureSystolic)
                .NotNull().WithMessage("La presión arterial sistólica es obligatoria")
                .InclusiveBetween(60, 250).WithMessage("La presión arterial sistólica debe estar entre 60 y 250 mmHg");

            RuleFor(x => x.BloodPressureDiastolic)
                .NotNull().WithMessage("La presión arterial diastólica es obligatoria")
                .InclusiveBetween(40, 150).WithMessage("La presión arterial diastólica debe estar entre 40 y 150 mmHg");

            RuleFor(x => x.Temperature)
                .NotNull().WithMessage("La temperatura es obligatoria")
                .InclusiveBetween(34.0m, 42.0m).WithMessage("La temperatura debe estar entre 34.0 y 42.0°C con un decimal");

            RuleFor(x => x.Weight)
                .NotNull().WithMessage("El peso es obligatorio")
                .InclusiveBetween(0.5m, 300m).WithMessage("El peso debe estar entre 0.5 y 300 kg con dos decimales");

            RuleFor(x => x.Height)
                .NotNull().WithMessage("La talla es obligatoria")
                .InclusiveBetween(30m, 250m).WithMessage("La talla debe estar entre 30 y 250 cm con dos decimales");

            RuleFor(x => x.HeartRate)
                .NotNull().WithMessage("La frecuencia cardíaca es obligatoria")
                .InclusiveBetween(30, 220).WithMessage("La frecuencia cardíaca debe estar entre 30 y 220 latidos por minuto");

            RuleFor(x => x.State)
                .NotNull().WithMessage("El estado es requerido")
                .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
        }
    }
}
