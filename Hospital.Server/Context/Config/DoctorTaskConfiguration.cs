using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class DoctorTaskConfiguration : IEntityTypeConfiguration<DoctorTask>
    {
        public void Configure(EntityTypeBuilder<DoctorTask> entity)
        {
            entity.ToTable("DoctorTasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.DueDate).IsRequired();
            entity.Property(e => e.Priority).HasDefaultValue(1);
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);

            // FK: Doctor (User)
            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            entity.HasIndex(e => e.DoctorId);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.IsCompleted);
        }
    }
}
