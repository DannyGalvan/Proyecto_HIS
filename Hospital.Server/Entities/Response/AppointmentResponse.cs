namespace Hospital.Server.Entities.Response
{
    public class AppointmentResponse
    {
        public long Id { get; set; }
        public long PatientId { get; set; }
        public long? DoctorId { get; set; }
        public long SpecialtyId { get; set; }
        public long BranchId { get; set; }
        public long AppointmentStatusId { get; set; }
        public string AppointmentDate { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Priority { get; set; }
        public string? ArrivalTime { get; set; }
        public string? Notes { get; set; }
        public int? FollowUpType { get; set; }
        public long? ParentConsultationId { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }

        // Navigation responses
        public virtual SpecialtyResponse? Specialty { get; set; }
        public virtual BranchResponse? Branch { get; set; }
        public virtual AppointmentStatusResponse? AppointmentStatus { get; set; }
    }
}
