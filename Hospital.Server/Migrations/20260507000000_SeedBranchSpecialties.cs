using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hospital.Server.Migrations
{
    /// <inheritdoc />
    public partial class SeedBranchSpecialties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed: las 8 especialidades disponibles en cada una de las 2 sedes.
            // 16 filas en total (Ids 1..16).
            migrationBuilder.InsertData(
                table: "BranchSpecialties",
                columns: ["Id", "BranchId", "SpecialtyId", "State", "CreatedAt", "CreatedBy", "UpdatedAt", "UpdatedBy"],
                values: new object[,]
                {
                    { 1L, 1L, 1L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 2L, 1L, 2L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 3L, 1L, 3L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 4L, 1L, 4L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 5L, 1L, 5L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 6L, 1L, 6L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 7L, 1L, 7L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 8L, 1L, 8L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 9L, 2L, 1L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 10L, 2L, 2L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 11L, 2L, 3L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 12L, 2L, 4L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 13L, 2L, 5L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 14L, 2L, 6L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 15L, 2L, 7L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null },
                    { 16L, 2L, 8L, 1, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "BranchSpecialties",
                keyColumn: "Id",
                keyValues: [1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L, 11L, 12L, 13L, 14L, 15L, 16L]);
        }
    }
}
