using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class LabOrderConfiguration : IEntityTypeConfiguration<LabOrder>
    {
        public void Configure(EntityTypeBuilder<LabOrder> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.OrderNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TotalAmount).HasPrecision(10, 2);
            entity.Property(e => e.Notes).HasMaxLength(2000);

            entity.HasIndex(e => e.OrderNumber).IsUnique();

            entity.HasOne(e => e.Consultation)
                .WithMany(c => c.LabOrders)
                .HasForeignKey(e => e.ConsultationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.ConsultationId);
            entity.HasIndex(e => e.PatientId);
        }
    }
}
