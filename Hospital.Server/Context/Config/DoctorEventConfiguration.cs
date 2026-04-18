using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class DoctorEventConfiguration : IEntityTypeConfiguration<DoctorEvent>
    {
        public void Configure(EntityTypeBuilder<DoctorEvent> entity)
        {
            entity.ToTable("DoctorEvents");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
            entity.Property(e => e.EventType).IsRequired();

            // FK: Doctor (User)
            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            entity.HasIndex(e => e.DoctorId);
            entity.HasIndex(e => e.StartDate);
            entity.HasIndex(e => e.EndDate);
        }
    }
}
