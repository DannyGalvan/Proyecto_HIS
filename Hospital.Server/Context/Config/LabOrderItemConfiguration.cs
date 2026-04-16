using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class LabOrderItemConfiguration : IEntityTypeConfiguration<LabOrderItem>
    {
        public void Configure(EntityTypeBuilder<LabOrderItem> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.ExamName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.ResultValue).HasMaxLength(100);
            entity.Property(e => e.ResultUnit).HasMaxLength(50);
            entity.Property(e => e.ReferenceRange).HasMaxLength(100);
            entity.Property(e => e.ResultNotes).HasMaxLength(500);

            entity.HasOne(e => e.LabOrder)
                .WithMany(o => o.Items)
                .HasForeignKey(e => e.LabOrderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.LabExam)
                .WithMany()
                .HasForeignKey(e => e.LabExamId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.LabOrderId);
        }
    }
}
