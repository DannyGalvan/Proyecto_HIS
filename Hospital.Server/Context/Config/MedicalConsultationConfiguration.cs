using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class MedicalConsultationConfiguration : IEntityTypeConfiguration<MedicalConsultation>
    {
        public void Configure(EntityTypeBuilder<MedicalConsultation> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.ReasonForVisit).HasMaxLength(5000).IsRequired();
            entity.Property(e => e.ClinicalFindings).HasMaxLength(5000).IsRequired();
            entity.Property(e => e.Diagnosis).HasMaxLength(5000);
            entity.Property(e => e.DiagnosisCie10Code).HasMaxLength(10);
            entity.Property(e => e.TreatmentPlan).HasMaxLength(5000);
            entity.Property(e => e.Notes).HasMaxLength(2000);

            entity.HasOne(e => e.Appointment)
                .WithMany()
                .HasForeignKey(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.AppointmentId).IsUnique();
            entity.HasIndex(e => e.DoctorId);
        }
    }
}
