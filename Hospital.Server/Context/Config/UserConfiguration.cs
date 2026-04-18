using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> entity)
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name)
                .HasMaxLength(255);
            entity.Property(e => e.UserName)
                .HasMaxLength(255);
            entity.Property(e => e.Password)
                .HasMaxLength(255);
            entity.Property(e => e.Number)
                .HasMaxLength(255);
            entity.Property(e => e.Email)
                .HasMaxLength(255);
            entity.Property(e => e.IdentificationDocument)
                .HasMaxLength(255);
            entity.Property(e => e.RecoveryToken)
                .HasMaxLength(255);
            entity.Property(e => e.Nit)
                .HasMaxLength(9);
            entity.Property(e => e.InsuranceNumber)
                .HasMaxLength(50);

            entity.HasOne(e => e.Rol)
                    .WithMany(e => e.Users)
                .HasForeignKey(e => e.RolId);

            entity.HasOne(e => e.Branch)
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            entity.HasOne(e => e.Specialty)
                .WithMany()
                .HasForeignKey(e => e.SpecialtyId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            entity.HasOne(e => e.Timezone)
                .WithMany()
                .HasForeignKey(e => e.TimezoneId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            //password: Guatemala1.
            entity.HasData(
                new User
                {
                    Id = 1,
                    RolId = 1,
                    Password = "$2a$12$86Ty8oUVWKPbU8JqCII9VO.FgM1C10dweQ4xKhM4jj1LWL9jwNu7.",
                    Name = "Super Administrador",
                    UserName = "SADMIN",
                    Number = "51995142",
                    Email = "pruebas.test29111999@gmail.com",
                    IdentificationDocument = "2987967910101",
                    RecoveryToken = "",
                    Reset = false,
                    State = 1,
                    CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                }
            );
        }
    }
}
