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
                },
                new User
                {
                    Id = 10,
                    RolId = 1,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Carlos Super Admin Dos",
                    UserName = "SADMIN02",
                    Number = "50000010",
                    Email = "sadmin02@hospital.local",
                    IdentificationDocument = "9000000000010",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 11,
                    RolId = 1,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Lucia Super Admin Tres",
                    UserName = "SADMIN03",
                    Number = "50000011",
                    Email = "sadmin03@hospital.local",
                    IdentificationDocument = "9000000000011",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 12,
                    RolId = 1,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Mario Super Admin Cuatro",
                    UserName = "SADMIN04",
                    Number = "50000012",
                    Email = "sadmin04@hospital.local",
                    IdentificationDocument = "9000000000012",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 13,
                    RolId = 2,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Ana Paciente Uno",
                    UserName = "PACIENTE01",
                    Number = "50000013",
                    Email = "paciente01@hospital.local",
                    IdentificationDocument = "9000000000013",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 14,
                    RolId = 2,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Pedro Paciente Dos",
                    UserName = "PACIENTE02",
                    Number = "50000014",
                    Email = "paciente02@hospital.local",
                    IdentificationDocument = "9000000000014",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 15,
                    RolId = 2,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Marta Paciente Tres",
                    UserName = "PACIENTE03",
                    Number = "50000015",
                    Email = "paciente03@hospital.local",
                    IdentificationDocument = "9000000000015",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 16,
                    RolId = 3,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Dra. Elena Cardio",
                    UserName = "MEDICO01",
                    Number = "50000016",
                    Email = "medico01@hospital.local",
                    IdentificationDocument = "9000000000016",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    SpecialtyId = 4,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 17,
                    RolId = 3,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Dr. Jorge Pediatra",
                    UserName = "MEDICO02",
                    Number = "50000017",
                    Email = "medico02@hospital.local",
                    IdentificationDocument = "9000000000017",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    SpecialtyId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 18,
                    RolId = 3,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Dra. Sofia General",
                    UserName = "MEDICO03",
                    Number = "50000018",
                    Email = "medico03@hospital.local",
                    IdentificationDocument = "9000000000018",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    SpecialtyId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 19,
                    RolId = 4,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Rosa Enfermera Uno",
                    UserName = "ENFERM01",
                    Number = "50000019",
                    Email = "enferm01@hospital.local",
                    IdentificationDocument = "9000000000019",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 20,
                    RolId = 4,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Luis Enfermero Dos",
                    UserName = "ENFERM02",
                    Number = "50000020",
                    Email = "enferm02@hospital.local",
                    IdentificationDocument = "9000000000020",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 21,
                    RolId = 4,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Patricia Enfermera Tres",
                    UserName = "ENFERM03",
                    Number = "50000021",
                    Email = "enferm03@hospital.local",
                    IdentificationDocument = "9000000000021",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 22,
                    RolId = 5,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Andrea Recepcion Uno",
                    UserName = "RECEP01",
                    Number = "50000022",
                    Email = "recep01@hospital.local",
                    IdentificationDocument = "9000000000022",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 23,
                    RolId = 5,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Diego Recepcion Dos",
                    UserName = "RECEP02",
                    Number = "50000023",
                    Email = "recep02@hospital.local",
                    IdentificationDocument = "9000000000023",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 24,
                    RolId = 5,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Karla Recepcion Tres",
                    UserName = "RECEP03",
                    Number = "50000024",
                    Email = "recep03@hospital.local",
                    IdentificationDocument = "9000000000024",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 25,
                    RolId = 6,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Laura Caja Uno",
                    UserName = "CAJERO01",
                    Number = "50000025",
                    Email = "cajero01@hospital.local",
                    IdentificationDocument = "9000000000025",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 26,
                    RolId = 6,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Manuel Caja Dos",
                    UserName = "CAJERO02",
                    Number = "50000026",
                    Email = "cajero02@hospital.local",
                    IdentificationDocument = "9000000000026",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 27,
                    RolId = 6,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Veronica Caja Tres",
                    UserName = "CAJERO03",
                    Number = "50000027",
                    Email = "cajero03@hospital.local",
                    IdentificationDocument = "9000000000027",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 28,
                    RolId = 7,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Roberto Farmacia Uno",
                    UserName = "FARMA01",
                    Number = "50000028",
                    Email = "farma01@hospital.local",
                    IdentificationDocument = "9000000000028",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 29,
                    RolId = 7,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Silvia Farmacia Dos",
                    UserName = "FARMA02",
                    Number = "50000029",
                    Email = "farma02@hospital.local",
                    IdentificationDocument = "9000000000029",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 30,
                    RolId = 7,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Hugo Farmacia Tres",
                    UserName = "FARMA03",
                    Number = "50000030",
                    Email = "farma03@hospital.local",
                    IdentificationDocument = "9000000000030",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 31,
                    RolId = 8,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Beatriz Lab Uno",
                    UserName = "LAB01",
                    Number = "50000031",
                    Email = "lab01@hospital.local",
                    IdentificationDocument = "9000000000031",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 32,
                    RolId = 8,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Tomas Lab Dos",
                    UserName = "LAB02",
                    Number = "50000032",
                    Email = "lab02@hospital.local",
                    IdentificationDocument = "9000000000032",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 1,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                },
                new User
                {
                    Id = 33,
                    RolId = 8,
                    Password = "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem",
                    Name = "Daniela Lab Tres",
                    UserName = "LAB03",
                    Number = "50000033",
                    Email = "lab03@hospital.local",
                    IdentificationDocument = "9000000000033",
                    RecoveryToken = "",
                    Reset = false,
                    BranchId = 2,
                    MustChangePassword = true,
                    State = 1,
                    CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = 1,
                    DateToken = null,
                    UpdatedAt = null,
                    UpdatedBy = null
                }
            );
        }
    }
}
