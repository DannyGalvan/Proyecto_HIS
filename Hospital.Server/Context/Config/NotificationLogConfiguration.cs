using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class NotificationLogConfiguration : IEntityTypeConfiguration<NotificationLog>
    {
        public void Configure(EntityTypeBuilder<NotificationLog> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.RecipientEmail).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Subject).HasMaxLength(500).IsRequired();
            entity.Property(e => e.RelatedEntityType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ErrorMessage).HasMaxLength(2000);

            // Composite index on RelatedEntityType and RelatedEntityId
            entity.HasIndex(e => new { e.RelatedEntityType, e.RelatedEntityId });

            // Index on Status
            entity.HasIndex(e => e.Status);

            // Index on RecipientEmail
            entity.HasIndex(e => e.RecipientEmail);
        }
    }
}
