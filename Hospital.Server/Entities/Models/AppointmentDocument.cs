using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    public class AppointmentDocument : IEntity<long>
    {
        public long Id { get; set; }

        /// <summary>
        /// FK to Appointment
        /// </summary>
        public long AppointmentId { get; set; }

        /// <summary>
        /// Original file name
        /// </summary>
        public string FileName { get; set; } = string.Empty;

        /// <summary>
        /// Stored file path or URL
        /// </summary>
        public string FilePath { get; set; } = string.Empty;

        /// <summary>
        /// MIME content type (application/pdf per RN-CU03-04)
        /// </summary>
        public string ContentType { get; set; } = string.Empty;

        /// <summary>
        /// File size in bytes (max 2MB per RN-CU03-04)
        /// </summary>
        public long FileSize { get; set; }

        public int State { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public long CreatedBy { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Appointment? Appointment { get; set; }
    }
}
