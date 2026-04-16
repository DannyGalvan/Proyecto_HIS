using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class LabExamConfiguration : IEntityTypeConfiguration<LabExam>
    {
        public void Configure(EntityTypeBuilder<LabExam> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.DefaultAmount).HasPrecision(10, 2);
            entity.Property(e => e.ReferenceRange).HasMaxLength(100);
            entity.Property(e => e.Unit).HasMaxLength(50);

            entity.HasOne(e => e.Laboratory)
                .WithMany()
                .HasForeignKey(e => e.LaboratoryId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            entity.HasData(
                new LabExam { Id = 1, Name = "Hemograma Completo", Description = "Análisis completo de células sanguíneas", DefaultAmount = 150.00m, ReferenceRange = "Varía por componente", Unit = "Varios", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 2, Name = "Glucosa en Ayunas", Description = "Medición de nivel de glucosa en sangre en ayunas", DefaultAmount = 75.00m, ReferenceRange = "70-100 mg/dL", Unit = "mg/dL", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 3, Name = "Perfil Lipídico", Description = "Medición de colesterol total, HDL, LDL y triglicéridos", DefaultAmount = 200.00m, ReferenceRange = "Colesterol <200 mg/dL", Unit = "mg/dL", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 4, Name = "Examen General de Orina", Description = "Análisis físico, químico y microscópico de orina", DefaultAmount = 60.00m, ReferenceRange = "Varía por componente", Unit = "Varios", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 5, Name = "Creatinina", Description = "Evaluación de función renal", DefaultAmount = 80.00m, ReferenceRange = "0.7-1.3 mg/dL", Unit = "mg/dL", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 6, Name = "Ácido Úrico", Description = "Medición de niveles de ácido úrico en sangre", DefaultAmount = 85.00m, ReferenceRange = "3.4-7.0 mg/dL", Unit = "mg/dL", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 7, Name = "Perfil Hepático", Description = "Evaluación de la función del hígado", DefaultAmount = 250.00m, ReferenceRange = "Varía por componente", Unit = "Varios", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 8, Name = "TSH (Tiroides)", Description = "Hormona estimulante de tiroides", DefaultAmount = 120.00m, ReferenceRange = "0.4-4.0 mIU/L", Unit = "mIU/L", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 9, Name = "Hemoglobina Glicosilada", Description = "Control de diabetes a largo plazo (últimos 3 meses)", DefaultAmount = 150.00m, ReferenceRange = "<5.7%", Unit = "%", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 },
                new LabExam { Id = 10, Name = "Prueba Rápida COVID-19", Description = "Detección rápida de antígenos SARS-CoV-2", DefaultAmount = 100.00m, ReferenceRange = "Negativo", Unit = "Cualitativo", State = 1, CreatedAt = new DateTime(2025, 2, 17, 0, 0, 0, DateTimeKind.Utc), CreatedBy = 1 }
            );
        }
    }
}
