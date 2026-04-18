using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents a personal task or reminder for a doctor.
    /// Priority enum: 0=Baja, 1=Normal, 2=Alta.
    /// </summary>
    public class DoctorTask : IEntity<long>
    {
        /// <summary>
        /// Gets or sets the unique identifier for the doctor task.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// FK to User — the doctor who owns this task.
        /// </summary>
        public long DoctorId { get; set; }

        /// <summary>
        /// Gets or sets the title of the task (3–200 chars).
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the optional description of the task (max 1000 chars).
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets the due date of the task (stored in UTC).
        /// </summary>
        public DateTime DueDate { get; set; }

        /// <summary>
        /// Gets or sets whether this task has been completed.
        /// </summary>
        public bool IsCompleted { get; set; } = false;

        /// <summary>
        /// Priority of the task.
        /// 0=Baja, 1=Normal, 2=Alta.
        /// </summary>
        public int Priority { get; set; } = 1;

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
        /// Navigation property to the Doctor (User) who owns this task.
        /// </summary>
        public virtual User? Doctor { get; set; }
    }
}
