using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class SpecialtyConfiguration : IEntityTypeConfiguration<Specialty>
    {
        public void Configure(EntityTypeBuilder<Specialty> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(250);

            entity.HasData(
                new Specialty { Id = 1, Name = "Medicina General", Description = "Atención médica primaria y diagnóstico general", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Specialty { Id = 2, Name = "Pediatría", Description = "Atención médica para niños y adolescentes", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Specialty { Id = 3, Name = "Ginecología", Description = "Salud reproductiva y atención de la mujer", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Specialty { Id = 4, Name = "Cardiología", Description = "Diagnóstico y tratamiento de enfermedades del corazón", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Specialty { Id = 5, Name = "Dermatología", Description = "Diagnóstico y tratamiento de enfermedades de la piel", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Specialty { Id = 6, Name = "Traumatología", Description = "Lesiones del sistema musculoesquelético", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Specialty { Id = 7, Name = "Oftalmología", Description = "Diagnóstico y tratamiento de enfermedades de los ojos", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Specialty { Id = 8, Name = "Neurología", Description = "Diagnóstico y tratamiento de enfermedades del sistema nervioso", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 }
            );
        }
    }
}
