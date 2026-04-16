using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class PrescriptionItemConfiguration : IEntityTypeConfiguration<PrescriptionItem>
    {
        public void Configure(EntityTypeBuilder<PrescriptionItem> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.MedicineName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Dosage).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Frequency).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Duration).HasMaxLength(200).IsRequired();
            entity.Property(e => e.SpecialInstructions).HasMaxLength(500);

            entity.HasOne(e => e.Prescription)
                .WithMany(p => p.Items)
                .HasForeignKey(e => e.PrescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.PrescriptionId);
        }
    }
}
