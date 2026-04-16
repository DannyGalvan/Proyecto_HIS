using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class LabOrderItemRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? LabOrderId { get; set; }
        public long? LabExamId { get; set; }
        public string? ExamName { get; set; }
        public decimal? Amount { get; set; }
        public string? ResultValue { get; set; }
        public string? ResultUnit { get; set; }
        public string? ReferenceRange { get; set; }
        public bool? IsOutOfRange { get; set; }
        public string? ResultNotes { get; set; }
        public DateTime? ResultDate { get; set; }
        public bool? IsPublished { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
    }
}
