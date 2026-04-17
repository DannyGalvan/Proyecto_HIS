using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class BranchSpecialtyConfiguration : IEntityTypeConfiguration<BranchSpecialty>
    {
        public void Configure(EntityTypeBuilder<BranchSpecialty> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            // A branch-specialty pair must be unique (no duplicate assignments)
            entity.HasIndex(e => new { e.BranchId, e.SpecialtyId }).IsUnique();

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Specialty)
                .WithMany()
                .HasForeignKey(e => e.SpecialtyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
