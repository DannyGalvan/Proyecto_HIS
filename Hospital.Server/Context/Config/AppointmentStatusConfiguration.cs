using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class AppointmentStatusConfiguration : IEntityTypeConfiguration<AppointmentStatus>
    {
        public void Configure(EntityTypeBuilder<AppointmentStatus> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(250);

            entity.HasData(
                new AppointmentStatus { Id = 1, Name = "Pendiente de Pago", Description = "Cita recién agendada, esperando confirmación de pago", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 2, Name = "Confirmada", Description = "Pago recibido, cita confirmada y lista para atención", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 3, Name = "Signos Vitales", Description = "Enfermero realizando toma de signos vitales al paciente", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 4, Name = "En Espera", Description = "Paciente esperando turno para consulta médica", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 5, Name = "Consulta Médica", Description = "Paciente en atención con el médico", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 6, Name = "Evaluado", Description = "Médico completó diagnóstico y plan de tratamiento", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 7, Name = "Laboratorio", Description = "Paciente en proceso de exámenes de laboratorio", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 8, Name = "Farmacia", Description = "Paciente en despacho de medicamentos", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 9, Name = "Atención Finalizada", Description = "Ciclo de atención completo, paciente dado de alta", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 10, Name = "No Asistió", Description = "El paciente no se presentó a la cita programada", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new AppointmentStatus { Id = 11, Name = "Cancelada", Description = "Cita cancelada por el paciente o el sistema", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 }
            );
        }
    }
}
