using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class LaboratoryConfiguration : IEntityTypeConfiguration<Laboratory>
    {
        public void Configure(EntityTypeBuilder<Laboratory> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(250);

            entity.HasData(
                new Laboratory { Id = 1, Name = "Laboratorio Central", Description = "Laboratorio interno principal del hospital", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Laboratory { Id = 2, Name = "Laboratorio de Urgencias", Description = "Laboratorio para análisis de emergencias", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 }
            );
        }
    }
}
