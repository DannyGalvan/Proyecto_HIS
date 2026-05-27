using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hospital.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPacientePresenteStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ID 12 already exists in DB as "Pendiente" — update it to "Paciente Presente"
            migrationBuilder.UpdateData(
                table: "AppointmentStatuses",
                keyColumn: "Id",
                keyValue: 12L,
                columns: ["Name", "Description", "CreatedAt", "CreatedBy", "State"],
                values: ["Paciente Presente", "Recepción verificó la llegada del paciente al hospital", new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 1]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert to original name
            migrationBuilder.UpdateData(
                table: "AppointmentStatuses",
                keyColumn: "Id",
                keyValue: 12L,
                columns: ["Name", "Description"],
                values: ["Pendiente", null]);
        }
    }
}
