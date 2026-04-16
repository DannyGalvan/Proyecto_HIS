using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class DispenseItemConfiguration : IEntityTypeConfiguration<DispenseItem>
    {
        public void Configure(EntityTypeBuilder<DispenseItem> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.OriginalMedicineName)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.DispensedMedicineName)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.UnitPrice)
                .HasPrecision(10, 2);

            entity.Property(e => e.SubstitutionReason)
                .HasMaxLength(500);

            entity.HasOne(e => e.Dispense)
                .WithMany(d => d.Items)
                .HasForeignKey(e => e.DispenseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Medicine)
                .WithMany()
                .HasForeignKey(e => e.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PrescriptionItem)
                .WithMany()
                .HasForeignKey(e => e.PrescriptionItemId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            entity.HasIndex(e => e.DispenseId);
            entity.HasIndex(e => e.MedicineId);
        }
    }
}
