using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hospital.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeZonaAndCalendarDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "TimezoneId",
                table: "Users",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DoctorEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DoctorId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: false),
                    IsAllDay = table.Column<bool>(type: "boolean", nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorEvents_Users_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorTasks",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DoctorId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorTasks_Users_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryMovements",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MedicineInventoryId = table.Column<long>(type: "bigint", nullable: false),
                    MedicineId = table.Column<long>(type: "bigint", nullable: false),
                    BranchId = table.Column<long>(type: "bigint", nullable: false),
                    MovementType = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    PreviousStock = table.Column<int>(type: "integer", nullable: false),
                    NewStock = table.Column<int>(type: "integer", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_MedicineInventories_MedicineInventoryId",
                        column: x => x.MedicineInventoryId,
                        principalTable: "MedicineInventories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryMovements_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Timezones",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IanaId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UtcOffset = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Timezones", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Timezones",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "DisplayName", "IanaId", "State", "UpdatedAt", "UpdatedBy", "UtcOffset" },
                values: new object[,]
                {
                    { 1L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-06:00) America/Guatemala", "America/Guatemala", 1, null, null, "-06:00" },
                    { 2L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-06:00) America/Mexico_City", "America/Mexico_City", 1, null, null, "-06:00" },
                    { 3L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-05:00) America/New_York", "America/New_York", 1, null, null, "-05:00" },
                    { 4L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-06:00) America/Chicago", "America/Chicago", 1, null, null, "-06:00" },
                    { 5L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-07:00) America/Denver", "America/Denver", 1, null, null, "-07:00" },
                    { 6L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-08:00) America/Los_Angeles", "America/Los_Angeles", 1, null, null, "-08:00" },
                    { 7L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-05:00) America/Bogota", "America/Bogota", 1, null, null, "-05:00" },
                    { 8L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-05:00) America/Lima", "America/Lima", 1, null, null, "-05:00" },
                    { 9L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-04:00) America/Santiago", "America/Santiago", 1, null, null, "-04:00" },
                    { 10L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-03:00) America/Argentina/Buenos_Aires", "America/Argentina/Buenos_Aires", 1, null, null, "-03:00" },
                    { 11L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC-03:00) America/Sao_Paulo", "America/Sao_Paulo", 1, null, null, "-03:00" },
                    { 12L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC+00:00) Europe/London", "Europe/London", 1, null, null, "+00:00" },
                    { 13L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC+01:00) Europe/Madrid", "Europe/Madrid", 1, null, null, "+01:00" },
                    { 14L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC+01:00) Europe/Berlin", "Europe/Berlin", 1, null, null, "+01:00" },
                    { 15L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC+09:00) Asia/Tokyo", "Asia/Tokyo", 1, null, null, "+09:00" },
                    { 16L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "(UTC+00:00) UTC", "UTC", 1, null, null, "+00:00" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1L,
                column: "TimezoneId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Users_TimezoneId",
                table: "Users",
                column: "TimezoneId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorEvents_DoctorId",
                table: "DoctorEvents",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorEvents_EndDate",
                table: "DoctorEvents",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorEvents_StartDate",
                table: "DoctorEvents",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorTasks_DoctorId",
                table: "DoctorTasks",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorTasks_DueDate",
                table: "DoctorTasks",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorTasks_IsCompleted",
                table: "DoctorTasks",
                column: "IsCompleted");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_BranchId",
                table: "InventoryMovements",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_MedicineId",
                table: "InventoryMovements",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_MedicineInventoryId",
                table: "InventoryMovements",
                column: "MedicineInventoryId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMovements_UserId",
                table: "InventoryMovements",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Timezones_IanaId",
                table: "Timezones",
                column: "IanaId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Timezones_TimezoneId",
                table: "Users",
                column: "TimezoneId",
                principalTable: "Timezones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Timezones_TimezoneId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "DoctorEvents");

            migrationBuilder.DropTable(
                name: "DoctorTasks");

            migrationBuilder.DropTable(
                name: "InventoryMovements");

            migrationBuilder.DropTable(
                name: "Timezones");

            migrationBuilder.DropIndex(
                name: "IX_Users_TimezoneId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TimezoneId",
                table: "Users");
        }
    }
}
