using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class TimezoneConfiguration : IEntityTypeConfiguration<Timezone>
    {
        public void Configure(EntityTypeBuilder<Timezone> builder)
        {
            builder.ToTable("Timezones");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.IanaId).HasMaxLength(100).IsRequired();
            builder.Property(e => e.DisplayName).HasMaxLength(200).IsRequired();
            builder.Property(e => e.UtcOffset).HasMaxLength(10).IsRequired();

            builder.HasIndex(e => e.IanaId).IsUnique();

            // Seed data: 16 IANA timezones
            var seedDate = new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc);

            builder.HasData(
                new Timezone { Id = 1, IanaId = "America/Guatemala", DisplayName = "(UTC-06:00) America/Guatemala", UtcOffset = "-06:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 2, IanaId = "America/Mexico_City", DisplayName = "(UTC-06:00) America/Mexico_City", UtcOffset = "-06:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 3, IanaId = "America/New_York", DisplayName = "(UTC-05:00) America/New_York", UtcOffset = "-05:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 4, IanaId = "America/Chicago", DisplayName = "(UTC-06:00) America/Chicago", UtcOffset = "-06:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 5, IanaId = "America/Denver", DisplayName = "(UTC-07:00) America/Denver", UtcOffset = "-07:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 6, IanaId = "America/Los_Angeles", DisplayName = "(UTC-08:00) America/Los_Angeles", UtcOffset = "-08:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 7, IanaId = "America/Bogota", DisplayName = "(UTC-05:00) America/Bogota", UtcOffset = "-05:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 8, IanaId = "America/Lima", DisplayName = "(UTC-05:00) America/Lima", UtcOffset = "-05:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 9, IanaId = "America/Santiago", DisplayName = "(UTC-04:00) America/Santiago", UtcOffset = "-04:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 10, IanaId = "America/Argentina/Buenos_Aires", DisplayName = "(UTC-03:00) America/Argentina/Buenos_Aires", UtcOffset = "-03:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 11, IanaId = "America/Sao_Paulo", DisplayName = "(UTC-03:00) America/Sao_Paulo", UtcOffset = "-03:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 12, IanaId = "Europe/London", DisplayName = "(UTC+00:00) Europe/London", UtcOffset = "+00:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 13, IanaId = "Europe/Madrid", DisplayName = "(UTC+01:00) Europe/Madrid", UtcOffset = "+01:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 14, IanaId = "Europe/Berlin", DisplayName = "(UTC+01:00) Europe/Berlin", UtcOffset = "+01:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 15, IanaId = "Asia/Tokyo", DisplayName = "(UTC+09:00) Asia/Tokyo", UtcOffset = "+09:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 },
                new Timezone { Id = 16, IanaId = "UTC", DisplayName = "(UTC+00:00) UTC", UtcOffset = "+00:00", State = 1, CreatedAt = seedDate, CreatedBy = 1 }
            );
        }
    }
}
