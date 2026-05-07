using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hospital.Server.Migrations
{
    /// <inheritdoc />
    public partial class SeedRolOperationsAndUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ----------------------------------------------------------------------
            // Usuarios seed (3 por rol, 24 en total, Ids 10..33).
            // Password BCrypt de "Guatemala1.." con MustChangePassword=true.
            // Las asignaciones Rol->Operation se siembran en runtime por
            // OperationSyncService.AssignDefaultPermissionsByRoleAsync().
            // ----------------------------------------------------------------------
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[]
                {
                    "Id", "RolId", "Password", "Email", "Name", "IdentificationDocument", "UserName",
                    "RecoveryToken", "DateToken", "Reset", "Number", "Nit", "BranchId", "InsuranceNumber",
                    "MustChangePassword", "LastPasswordChange", "FailedLoginAttempts", "LockoutEnd",
                    "State", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "SpecialtyId", "TimezoneId"
                },
                values: new object[,]
                {
                    { 10L, 1L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "sadmin02@hospital.local", "Carlos Super Admin Dos", "9000000000010", "SADMIN02", "", null, false, "50000010", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 11L, 1L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "sadmin03@hospital.local", "Lucia Super Admin Tres", "9000000000011", "SADMIN03", "", null, false, "50000011", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 12L, 1L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "sadmin04@hospital.local", "Mario Super Admin Cuatro", "9000000000012", "SADMIN04", "", null, false, "50000012", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 13L, 2L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "paciente01@hospital.local", "Ana Paciente Uno", "9000000000013", "PACIENTE01", "", null, false, "50000013", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 14L, 2L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "paciente02@hospital.local", "Pedro Paciente Dos", "9000000000014", "PACIENTE02", "", null, false, "50000014", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 15L, 2L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "paciente03@hospital.local", "Marta Paciente Tres", "9000000000015", "PACIENTE03", "", null, false, "50000015", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 16L, 3L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "medico01@hospital.local", "Dra. Elena Cardio", "9000000000016", "MEDICO01", "", null, false, "50000016", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, 4L, null },
                    { 17L, 3L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "medico02@hospital.local", "Dr. Jorge Pediatra", "9000000000017", "MEDICO02", "", null, false, "50000017", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, 2L, null },
                    { 18L, 3L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "medico03@hospital.local", "Dra. Sofia General", "9000000000018", "MEDICO03", "", null, false, "50000018", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, 1L, null },
                    { 19L, 4L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "enferm01@hospital.local", "Rosa Enfermera Uno", "9000000000019", "ENFERM01", "", null, false, "50000019", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 20L, 4L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "enferm02@hospital.local", "Luis Enfermero Dos", "9000000000020", "ENFERM02", "", null, false, "50000020", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 21L, 4L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "enferm03@hospital.local", "Patricia Enfermera Tres", "9000000000021", "ENFERM03", "", null, false, "50000021", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 22L, 5L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "recep01@hospital.local", "Andrea Recepcion Uno", "9000000000022", "RECEP01", "", null, false, "50000022", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 23L, 5L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "recep02@hospital.local", "Diego Recepcion Dos", "9000000000023", "RECEP02", "", null, false, "50000023", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 24L, 5L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "recep03@hospital.local", "Karla Recepcion Tres", "9000000000024", "RECEP03", "", null, false, "50000024", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 25L, 6L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "cajero01@hospital.local", "Laura Caja Uno", "9000000000025", "CAJERO01", "", null, false, "50000025", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 26L, 6L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "cajero02@hospital.local", "Manuel Caja Dos", "9000000000026", "CAJERO02", "", null, false, "50000026", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 27L, 6L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "cajero03@hospital.local", "Veronica Caja Tres", "9000000000027", "CAJERO03", "", null, false, "50000027", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 28L, 7L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "farma01@hospital.local", "Roberto Farmacia Uno", "9000000000028", "FARMA01", "", null, false, "50000028", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 29L, 7L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "farma02@hospital.local", "Silvia Farmacia Dos", "9000000000029", "FARMA02", "", null, false, "50000029", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 30L, 7L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "farma03@hospital.local", "Hugo Farmacia Tres", "9000000000030", "FARMA03", "", null, false, "50000030", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 31L, 8L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "lab01@hospital.local", "Beatriz Lab Uno", "9000000000031", "LAB01", "", null, false, "50000031", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 32L, 8L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "lab02@hospital.local", "Tomas Lab Dos", "9000000000032", "LAB02", "", null, false, "50000032", "", 1L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null },
                    { 33L, 8L, "$2a$11$Bt83LybdjlUy2pQSZ5IdnONf.d9jfwiUnia2v11Ex2qe3dpz1hDem", "lab03@hospital.local", "Daniela Lab Tres", "9000000000033", "LAB03", "", null, false, "50000033", "", 2L, null, true, null, 0, null, 1, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, null, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revertir Users
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    10L, 11L, 12L, 13L, 14L, 15L, 16L, 17L, 18L, 19L, 20L, 21L,
                    22L, 23L, 24L, 25L, 26L, 27L, 28L, 29L, 30L, 31L, 32L, 33L
                });

        }
    }
}
