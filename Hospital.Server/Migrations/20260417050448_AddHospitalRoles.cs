using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hospital.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddHospitalRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Description", "Name", "State", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    //{ 3L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Médico que atiende consultas y evalúa pacientes", "Medico", 1, null, null },
                    { 4L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Rol interino para toma de signos vitales", "Enfermero", 1, null, null },
                    { 5L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Personal de recepción y verificación de citas", "Recepcionista", 1, null, null },
                    { 6L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Personal de caja para cobro de consultas", "Cajero", 1, null, null },
                    { 7L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Personal de farmacia para despacho de medicamentos", "Farmaceutico", 1, null, null },
                    { 8L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Personal de laboratorio para procesamiento de exámenes", "Laboratorista", 1, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3L);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 4L);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 5L);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 6L);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 7L);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 8L);
        }
    }
}
