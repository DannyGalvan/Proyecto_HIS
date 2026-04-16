using FluentValidation;
using Hospital.Server.Entities.Request;
using Hospital.Server.Validations.Common;

namespace Hospital.Server.Validations.VitalSign
{
    /// <summary>
    /// Defines the <see cref="PartialVitalSignValidation" />
    /// </summary>
    public class PartialVitalSignValidation : PartialUpdateValidator<VitalSignRequest, long?>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PartialVitalSignValidation"/> class.
        /// </summary>
        public PartialVitalSignValidation()
        {
            When(x => x.AppointmentId != null, () =>
            {
                RuleFor(x => x.AppointmentId)
                    .GreaterThan(0).WithMessage("La cita asociada debe ser mayor a 0");
            });

            When(x => x.NurseId != null, () =>
            {
                RuleFor(x => x.NurseId)
                    .GreaterThan(0).WithMessage("El enfermero debe ser mayor a 0");
            });

            When(x => x.BloodPressureSystolic != null, () =>
            {
                RuleFor(x => x.BloodPressureSystolic)
                    .InclusiveBetween(60, 250).WithMessage("La presión arterial sistólica debe estar entre 60 y 250 mmHg");
            });

            When(x => x.BloodPressureDiastolic != null, () =>
            {
                RuleFor(x => x.BloodPressureDiastolic)
                    .InclusiveBetween(40, 150).WithMessage("La presión arterial diastólica debe estar entre 40 y 150 mmHg");
            });

            When(x => x.Temperature != null, () =>
            {
                RuleFor(x => x.Temperature)
                    .InclusiveBetween(34.0m, 42.0m).WithMessage("La temperatura debe estar entre 34.0 y 42.0°C con un decimal");
            });

            When(x => x.Weight != null, () =>
            {
                RuleFor(x => x.Weight)
                    .InclusiveBetween(0.5m, 300m).WithMessage("El peso debe estar entre 0.5 y 300 kg con dos decimales");
            });

            When(x => x.Height != null, () =>
            {
                RuleFor(x => x.Height)
                    .InclusiveBetween(30m, 250m).WithMessage("La talla debe estar entre 30 y 250 cm con dos decimales");
            });

            When(x => x.HeartRate != null, () =>
            {
                RuleFor(x => x.HeartRate)
                    .InclusiveBetween(30, 220).WithMessage("La frecuencia cardíaca debe estar entre 30 y 220 latidos por minuto");
            });

            When(x => x.State != null, () =>
            {
                RuleFor(x => x.State)
                    .InclusiveBetween(0, 1).WithMessage("El estado debe ser 0 o 1");
            });
        }
    }
}
