using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.TransactionNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.CardLastFourDigits).HasMaxLength(4);
            entity.Property(e => e.IdempotencyKey).HasMaxLength(100);
            entity.Property(e => e.AmountReceived).HasPrecision(10, 2);
            entity.Property(e => e.ChangeAmount).HasPrecision(10, 2);
            entity.Property(e => e.GatewayResponseCode).HasMaxLength(50);
            entity.Property(e => e.GatewayMessage).HasMaxLength(500);

            // Unique constraint on TransactionNumber
            entity.HasIndex(e => e.TransactionNumber).IsUnique();

            // Unique constraint on IdempotencyKey (RNF-016)
            entity.HasIndex(e => e.IdempotencyKey).IsUnique().HasFilter("\"IdempotencyKey\" IS NOT NULL");

            // FK: Appointment
            entity.HasOne(e => e.Appointment)
                .WithMany(a => a.Payments)
                .HasForeignKey(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            entity.HasIndex(e => e.AppointmentId);
            entity.HasIndex(e => e.PaymentDate);
        }
    }
}
