using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents a personal event or availability block for a doctor.
    /// EventType enum: 0=Reunión, 1=Descanso, 2=Capacitación, 3=Personal, 4=Otro.
    /// </summary>
    public class DoctorEvent : IEntity<long>
    {
        /// <summary>
        /// Gets or sets the unique identifier for the doctor event.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// FK to User — the doctor who owns this event.
        /// </summary>
        public long DoctorId { get; set; }

        /// <summary>
        /// Gets or sets the title of the event (3–200 chars).
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the optional description of the event (max 500 chars).
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets the start date and time of the event (stored in UTC).
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// Gets or sets the end date and time of the event (stored in UTC).
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Type of event.
        /// 0=Reunión, 1=Descanso, 2=Capacitación, 3=Personal, 4=Otro.
        /// </summary>
        public int EventType { get; set; }

        /// <summary>
        /// Gets or sets whether this event spans the entire day.
        /// </summary>
        public bool IsAllDay { get; set; }

        /// <summary>
        /// Gets or sets the state of the record (active/inactive). Default: 1 (active).
        /// </summary>
        public int State { get; set; } = 1;

        /// <summary>
        /// Gets or sets the date and time when the record was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the user ID who created the record.
        /// </summary>
        public long CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the user ID who last updated the record.
        /// </summary>
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the record was last updated.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties

        /// <summary>
        /// Navigation property to the Doctor (User) who owns this event.
        /// </summary>
        public virtual User? Doctor { get; set; }
    }
}
