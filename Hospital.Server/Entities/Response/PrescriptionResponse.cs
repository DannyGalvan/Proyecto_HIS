namespace Hospital.Server.Entities.Response
{
    public class PrescriptionResponse
    {
        public long Id { get; set; }
        public long ConsultationId { get; set; }
        public long DoctorId { get; set; }
        public string PrescriptionDate { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int State { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public string? UpdatedAt { get; set; }

        /// <summary>Items included when fetched with include=Items</summary>
        public virtual ICollection<PrescriptionItemResponse>? Items { get; set; }
    }
}
