namespace Hospital.Server.Entities.Response
{
    public class VitalSignResponse
    {
        public long Id { get; set; }
        public long AppointmentId { get; set; }
        public long NurseId { get; set; }
        public int BloodPressureSystolic { get; set; }
        public int BloodPressureDiastolic { get; set; }
        public decimal Temperature { get; set; }
        public decimal Weight { get; set; }
        public decimal Height { get; set; }
        public int HeartRate { get; set; }
        public bool IsEmergency { get; set; }
        public string? ClinicalAlerts { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
