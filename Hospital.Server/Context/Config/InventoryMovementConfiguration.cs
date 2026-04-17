using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class InventoryMovementConfiguration : IEntityTypeConfiguration<InventoryMovement>
    {
        public void Configure(EntityTypeBuilder<InventoryMovement> entity)
        {
            entity.ToTable("InventoryMovements");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            // Decimal precision
            entity.Property(e => e.UnitCost).HasPrecision(10, 2);
            entity.Property(e => e.TotalCost).HasPrecision(10, 2);

            // String max lengths
            entity.Property(e => e.ReferenceNumber).HasMaxLength(100);
            entity.Property(e => e.ReferenceType).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(500);

            // FK: MedicineInventory
            entity.HasOne(e => e.MedicineInventory)
                .WithMany()
                .HasForeignKey(e => e.MedicineInventoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // FK: Medicine
            entity.HasOne(e => e.Medicine)
                .WithMany()
                .HasForeignKey(e => e.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            // FK: Branch
            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            // FK: User (who performed the movement)
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
