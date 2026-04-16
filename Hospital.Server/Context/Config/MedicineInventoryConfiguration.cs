using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class MedicineInventoryConfiguration : IEntityTypeConfiguration<MedicineInventory>
    {
        public void Configure(EntityTypeBuilder<MedicineInventory> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            // Configure RowVersion for PostgreSQL optimistic concurrency control (RNF-025)
            // Uses PostgreSQL xmin system column
            entity.Property(e => e.RowVersion).IsRowVersion();

            // Configure foreign key to Medicine with Restrict delete
            entity.HasOne(e => e.Medicine)
                .WithMany()
                .HasForeignKey(e => e.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure foreign key to Branch with Restrict delete
            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            // Create unique composite index on (MedicineId, BranchId)
            entity.HasIndex(e => new { e.MedicineId, e.BranchId }).IsUnique();
        }
    }
}
