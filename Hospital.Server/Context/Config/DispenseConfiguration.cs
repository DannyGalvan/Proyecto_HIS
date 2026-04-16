using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class DispenseConfiguration : IEntityTypeConfiguration<Dispense>
    {
        public void Configure(EntityTypeBuilder<Dispense> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.TotalAmount)
                .HasPrecision(10, 2);

            entity.Property(e => e.Notes)
                .HasMaxLength(2000);

            entity.HasOne(e => e.Prescription)
                .WithMany(p => p.Dispenses)
                .HasForeignKey(e => e.PrescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Pharmacist)
                .WithMany()
                .HasForeignKey(e => e.PharmacistId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.PrescriptionId);
            entity.HasIndex(e => e.PatientId);
        }
    }
}
