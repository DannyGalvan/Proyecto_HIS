namespace Hospital.Server.Entities.Response
{
    public class LabOrderItemResponse
    {
        public long Id { get; set; }
        public long LabOrderId { get; set; }
        public long LabExamId { get; set; }
        public string ExamName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? ResultValue { get; set; }
        public string? ResultUnit { get; set; }
        public string? ReferenceRange { get; set; }
        public bool IsOutOfRange { get; set; }
        public string? ResultNotes { get; set; }
        public string? ResultDate { get; set; }
        public bool IsPublished { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
