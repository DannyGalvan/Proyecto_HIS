using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class BranchConfiguration : IEntityTypeConfiguration<Branch>
    {
        public void Configure(EntityTypeBuilder<Branch> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(250);

            entity.HasData(
                new Branch { Id = 1, Name = "Sede Central", Phone = "22345678", Address = "Ciudad de Guatemala, Zona 10", Description = "Sede principal del hospital", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new Branch { Id = 2, Name = "Sede Zona 1", Phone = "22345679", Address = "Ciudad de Guatemala, Zona 1", Description = "Sucursal centro histórico", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 }
            );
        }
    }
}
