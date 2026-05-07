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

            // Seed: las 8 especialidades disponibles en ambas sedes (16 filas).
            entity.HasData(
                new BranchSpecialty { Id = 1, BranchId = 1, SpecialtyId = 1, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 2, BranchId = 1, SpecialtyId = 2, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 3, BranchId = 1, SpecialtyId = 3, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 4, BranchId = 1, SpecialtyId = 4, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 5, BranchId = 1, SpecialtyId = 5, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 6, BranchId = 1, SpecialtyId = 6, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 7, BranchId = 1, SpecialtyId = 7, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 8, BranchId = 1, SpecialtyId = 8, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 9, BranchId = 2, SpecialtyId = 1, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 10, BranchId = 2, SpecialtyId = 2, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 11, BranchId = 2, SpecialtyId = 3, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 12, BranchId = 2, SpecialtyId = 4, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 13, BranchId = 2, SpecialtyId = 5, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 14, BranchId = 2, SpecialtyId = 6, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 15, BranchId = 2, SpecialtyId = 7, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null },
                new BranchSpecialty { Id = 16, BranchId = 2, SpecialtyId = 8, State = 1, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1, UpdatedAt = null, UpdatedBy = null }
            );
        }
    }
}
