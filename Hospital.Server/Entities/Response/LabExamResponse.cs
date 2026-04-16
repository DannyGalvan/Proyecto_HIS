namespace Hospital.Server.Entities.Response
{
    public class LabExamResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal DefaultAmount { get; set; }
        public string ReferenceRange { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public long? LaboratoryId { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
