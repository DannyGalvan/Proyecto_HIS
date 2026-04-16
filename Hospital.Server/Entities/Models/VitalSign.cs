using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class VitalSign : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to Appointment
        /// </summary>
        public long AppointmentId { get; set; }

        /// <summary>
        /// FK to User (Nurse who recorded the vitals)
        /// </summary>
        public long NurseId { get; set; }

        /// <summary>
        /// Systolic blood pressure in mmHg (RN-CU07-01: 60-250)
        /// </summary>
        public int BloodPressureSystolic { get; set; }

        /// <summary>
        /// Diastolic blood pressure in mmHg (RN-CU07-01: 40-150)
        /// </summary>
        public int BloodPressureDiastolic { get; set; }

        /// <summary>
        /// Temperature in Celsius with 1 decimal (RN-CU07-02: 34.0-42.0)
        /// </summary>
        public decimal Temperature { get; set; }

        /// <summary>
        /// Weight in kg with 2 decimals (RN-CU07-03: 0.5-300)
        /// </summary>
        public decimal Weight { get; set; }

        /// <summary>
        /// Height in cm with 2 decimals (RN-CU07-04: 30-250)
        /// </summary>
        public decimal Height { get; set; }

        /// <summary>
        /// Heart rate in bpm (RN-CU07-05: 30-220)
        /// </summary>
        public int HeartRate { get; set; }

        /// <summary>
        /// Whether this was recorded as emergency (CU-07 FA01)
        /// </summary>
        public bool IsEmergency { get; set; } = false;

        /// <summary>
        /// Auto-generated clinical alerts for out-of-normal-range values (RN-CU07-06)
        /// </summary>
        public string? ClinicalAlerts { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Appointment? Appointment { get; set; }
        public virtual User? Nurse { get; set; }
    }
}
