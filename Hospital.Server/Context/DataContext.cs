using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Context
{
    public class DataContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="DataContext"/> class.
        /// </summary>
        public DataContext()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DataContext"/> class.
        /// </summary>
        /// <param name="options">The options<see cref="DbContextOptions{DataContext}"/></param>
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        /// <summary>
        /// Configura las advertencias del contexto
        /// </summary>
        /// <param name="optionsBuilder">El constructor de opciones</param>
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warn => { warn.Default(WarningBehavior.Ignore); });
        }

        // Add DbSet for each entity

        /// <summary>
        /// Gets or sets the Users
        /// </summary>
        public DbSet<User> Users { get; set; }

        /// <summary>
        /// Gets or sets the Modules
        /// </summary>
        public DbSet<Module> Modules { get; set; }

        /// <summary>
        /// Gets or sets the Operations
        /// </summary>
        public DbSet<Operation> Operations { get; set; }

        /// <summary>
        /// Gets or sets the Roles
        /// </summary>
        public DbSet<Rol> Roles { get; set; }

        /// <summary>
        /// Gets or sets the RolOperations
        /// </summary>
        public DbSet<RolOperation> RolOperations { get; set; }

        /// <summary>
        /// Gets or sets the LoginAudits
        /// </summary>
        public DbSet<LoginAudit> LoginAudits { get; set; }

        /// <summary>
        /// Gets or sets the PasswordHistories
        /// </summary>
        public DbSet<PasswordHistory> PasswordHistories { get; set; }

        // Catalogs
        public DbSet<Specialty> Specialties { get; set; }
        public DbSet<Laboratory> Laboratories { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<AppointmentStatus> AppointmentStatuses { get; set; }

        // Core entities
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<AppointmentDocument> AppointmentDocuments { get; set; }

        // Clinical entities
        public DbSet<VitalSign> VitalSigns { get; set; }
        public DbSet<MedicalConsultation> MedicalConsultations { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<PrescriptionItem> PrescriptionItems { get; set; }

        // Laboratory entities
        public DbSet<LabExam> LabExams { get; set; }
        public DbSet<LabOrder> LabOrders { get; set; }
        public DbSet<LabOrderItem> LabOrderItems { get; set; }

        // Pharmacy entities (CU-10)
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<MedicineInventory> MedicineInventories { get; set; }
        public DbSet<Dispense> Dispenses { get; set; }
        public DbSet<DispenseItem> DispenseItems { get; set; }

        // Notification tracking (CU-11)
        public DbSet<NotificationLog> NotificationLogs { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(DataContext).Assembly);

            // Configurar conversión automática de DateTime a UTC para PostgreSQL
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(
                            new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                                v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v.ToUniversalTime(),
                                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                            )
                        );
                    }
                }
            }
        }
    }
}