using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Request
{
    public class PrescriptionRequest : IRequest<long?>
    {
        public long? Id { get; set; }
        public long? ConsultationId { get; set; }
        public long? DoctorId { get; set; }
        public DateTime? PrescriptionDate { get; set; }
        public string? Notes { get; set; }
        public int? State { get; set; }
        public long? CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Items to create together with the prescription (used in CreateWithItems endpoint).
        /// Ignored by the generic EntityService — handled by the custom controller action.
        /// </summary>
        public List<PrescriptionItemRequest>? Items { get; set; }
    }
}
