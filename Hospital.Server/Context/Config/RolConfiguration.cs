using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class RolConfiguration : IEntityTypeConfiguration<Rol>
    {
        public void Configure(EntityTypeBuilder<Rol> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name)
                .HasMaxLength(255);
            entity.Property(e => e.Description)
                .HasMaxLength(255);
            entity.HasData(
                new Rol
                {
                    Id = 1,
                    Name = "SA",
                    Description = "Super Administrator",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new Rol
                {
                    Id = 2,
                    Name = "Paciente",
                    Description = "Paciente externo del portal público",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new Rol
                {
                    Id = 3,
                    Name = "Medico",
                    Description = "Médico que atiende consultas y evalúa pacientes",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new Rol
                {
                    Id = 4,
                    Name = "Enfermero",
                    Description = "Rol interino para toma de signos vitales",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new Rol
                {
                    Id = 5,
                    Name = "Recepcionista",
                    Description = "Personal de recepción y verificación de citas",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new Rol
                {
                    Id = 6,
                    Name = "Cajero",
                    Description = "Personal de caja para cobro de consultas",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new Rol
                {
                    Id = 7,
                    Name = "Farmaceutico",
                    Description = "Personal de farmacia para despacho de medicamentos",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new Rol
                {
                    Id = 8,
                    Name = "Laboratorista",
                    Description = "Personal de laboratorio para procesamiento de exámenes",
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    UpdatedAt = null,
                    UpdatedBy = null
                }
            );
        }
    }
}
