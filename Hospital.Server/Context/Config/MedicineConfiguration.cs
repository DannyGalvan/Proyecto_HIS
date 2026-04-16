using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
    {
        public void Configure(EntityTypeBuilder<Medicine> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.DefaultPrice).IsRequired().HasPrecision(10, 2);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(50);
            entity.Property(e => e.IsControlled).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.MinimumStock).IsRequired().HasDefaultValue(0);
            entity.Property(e => e.State).IsRequired().HasDefaultValue(1);

            // Seed data - 10 common medicines
            var createdAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc);

            entity.HasData(
                new Medicine { Id = 1, Name = "Acetaminofén", Description = "Analgésico y antipirético para el alivio del dolor y la fiebre", DefaultPrice = 5.00m, Unit = "tableta", IsControlled = false, MinimumStock = 100, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 2, Name = "Ibuprofeno", Description = "Antiinflamatorio no esteroideo para dolor e inflamación", DefaultPrice = 8.00m, Unit = "tableta", IsControlled = false, MinimumStock = 80, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 3, Name = "Amoxicilina 500mg", Description = "Antibiótico de amplio espectro para infecciones bacterianas", DefaultPrice = 15.00m, Unit = "cápsula", IsControlled = false, MinimumStock = 50, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 4, Name = "Omeprazol 20mg", Description = "Inhibidor de la bomba de protones para acidez y reflujo gástrico", DefaultPrice = 12.00m, Unit = "cápsula", IsControlled = false, MinimumStock = 75, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 5, Name = "Metformina 850mg", Description = "Medicamento para el control de la diabetes tipo 2", DefaultPrice = 10.00m, Unit = "tableta", IsControlled = false, MinimumStock = 120, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 6, Name = "Losartán 50mg", Description = "Antagonista de angiotensina para la hipertensión", DefaultPrice = 18.00m, Unit = "tableta", IsControlled = false, MinimumStock = 90, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 7, Name = "Atorvastatina 20mg", Description = "Estatina para reducir el colesterol y los triglicéridos", DefaultPrice = 25.00m, Unit = "tableta", IsControlled = false, MinimumStock = 60, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 8, Name = "Diclofenaco 50mg", Description = "Antiinflamatorio no esteroideo para dolor y artritis", DefaultPrice = 6.00m, Unit = "tableta", IsControlled = false, MinimumStock = 110, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 9, Name = "Ranitidina 150mg", Description = "Bloqueador de histamina H2 para la úlcera péptica y GERD", DefaultPrice = 7.00m, Unit = "tableta", IsControlled = false, MinimumStock = 85, State = 1, CreatedAt = createdAt, CreatedBy = 1 },
                new Medicine { Id = 10, Name = "Tramadol 50mg", Description = "Analgésico opiáceo para el dolor moderado a severo", DefaultPrice = 35.00m, Unit = "cápsula", IsControlled = true, MinimumStock = 30, State = 1, CreatedAt = createdAt, CreatedBy = 1 }
            );
        }
    }
}
