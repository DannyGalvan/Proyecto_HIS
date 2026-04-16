using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Project.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPharmacyAndNotificationEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "DispenseId",
                table: "Payments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FollowUpType",
                table: "Appointments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ParentConsultationId",
                table: "Appointments",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Dispenses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrescriptionId = table.Column<long>(type: "bigint", nullable: false),
                    PatientId = table.Column<long>(type: "bigint", nullable: false),
                    PharmacistId = table.Column<long>(type: "bigint", nullable: false),
                    DispenseStatus = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dispenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dispenses_Prescriptions_PrescriptionId",
                        column: x => x.PrescriptionId,
                        principalTable: "Prescriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Dispenses_Users_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Dispenses_Users_PharmacistId",
                        column: x => x.PharmacistId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Medicines",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DefaultPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsControlled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MinimumStock = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    State = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicines", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RecipientEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    NotificationType = table.Column<int>(type: "integer", nullable: false),
                    RelatedEntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RelatedEntityId = table.Column<long>(type: "bigint", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RetryCount = table.Column<int>(type: "integer", nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DispenseItems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DispenseId = table.Column<long>(type: "bigint", nullable: false),
                    MedicineId = table.Column<long>(type: "bigint", nullable: false),
                    PrescriptionItemId = table.Column<long>(type: "bigint", nullable: true),
                    OriginalMedicineName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DispensedMedicineName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    WasSubstituted = table.Column<bool>(type: "boolean", nullable: false),
                    SubstitutionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DispenseItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DispenseItems_Dispenses_DispenseId",
                        column: x => x.DispenseId,
                        principalTable: "Dispenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DispenseItems_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DispenseItems_PrescriptionItems_PrescriptionItemId",
                        column: x => x.PrescriptionItemId,
                        principalTable: "PrescriptionItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicineInventories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MedicineId = table.Column<long>(type: "bigint", nullable: false),
                    BranchId = table.Column<long>(type: "bigint", nullable: false),
                    CurrentStock = table.Column<int>(type: "integer", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicineInventories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicineInventories_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicineInventories_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Medicines",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "DefaultPrice", "Description", "MinimumStock", "Name", "State", "Unit", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 5.00m, "Analgésico y antipirético para el alivio del dolor y la fiebre", 100, "Acetaminofén", 1, "tableta", null, null },
                    { 2L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 8.00m, "Antiinflamatorio no esteroideo para dolor e inflamación", 80, "Ibuprofeno", 1, "tableta", null, null },
                    { 3L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 15.00m, "Antibiótico de amplio espectro para infecciones bacterianas", 50, "Amoxicilina 500mg", 1, "cápsula", null, null },
                    { 4L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 12.00m, "Inhibidor de la bomba de protones para acidez y reflujo gástrico", 75, "Omeprazol 20mg", 1, "cápsula", null, null },
                    { 5L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 10.00m, "Medicamento para el control de la diabetes tipo 2", 120, "Metformina 850mg", 1, "tableta", null, null },
                    { 6L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 18.00m, "Antagonista de angiotensina para la hipertensión", 90, "Losartán 50mg", 1, "tableta", null, null },
                    { 7L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 25.00m, "Estatina para reducir el colesterol y los triglicéridos", 60, "Atorvastatina 20mg", 1, "tableta", null, null },
                    { 8L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 6.00m, "Antiinflamatorio no esteroideo para dolor y artritis", 110, "Diclofenaco 50mg", 1, "tableta", null, null },
                    { 9L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 7.00m, "Bloqueador de histamina H2 para la úlcera péptica y GERD", 85, "Ranitidina 150mg", 1, "tableta", null, null }
                });

            migrationBuilder.InsertData(
                table: "Medicines",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "DefaultPrice", "Description", "IsControlled", "MinimumStock", "Name", "State", "Unit", "UpdatedAt", "UpdatedBy" },
                values: new object[] { 10L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 35.00m, "Analgésico opiáceo para el dolor moderado a severo", true, 30, "Tramadol 50mg", 1, "cápsula", null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_DispenseId",
                table: "Payments",
                column: "DispenseId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ParentConsultationId",
                table: "Appointments",
                column: "ParentConsultationId");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseItems_DispenseId",
                table: "DispenseItems",
                column: "DispenseId");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseItems_MedicineId",
                table: "DispenseItems",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_DispenseItems_PrescriptionItemId",
                table: "DispenseItems",
                column: "PrescriptionItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Dispenses_PatientId",
                table: "Dispenses",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Dispenses_PharmacistId",
                table: "Dispenses",
                column: "PharmacistId");

            migrationBuilder.CreateIndex(
                name: "IX_Dispenses_PrescriptionId",
                table: "Dispenses",
                column: "PrescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineInventories_BranchId",
                table: "MedicineInventories",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineInventories_MedicineId_BranchId",
                table: "MedicineInventories",
                columns: new[] { "MedicineId", "BranchId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_RecipientEmail",
                table: "NotificationLogs",
                column: "RecipientEmail");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_RelatedEntityType_RelatedEntityId",
                table: "NotificationLogs",
                columns: new[] { "RelatedEntityType", "RelatedEntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLogs_Status",
                table: "NotificationLogs",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_MedicalConsultations_ParentConsultationId",
                table: "Appointments",
                column: "ParentConsultationId",
                principalTable: "MedicalConsultations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Dispenses_DispenseId",
                table: "Payments",
                column: "DispenseId",
                principalTable: "Dispenses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_MedicalConsultations_ParentConsultationId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Dispenses_DispenseId",
                table: "Payments");

            migrationBuilder.DropTable(
                name: "DispenseItems");

            migrationBuilder.DropTable(
                name: "MedicineInventories");

            migrationBuilder.DropTable(
                name: "NotificationLogs");

            migrationBuilder.DropTable(
                name: "Dispenses");

            migrationBuilder.DropTable(
                name: "Medicines");

            migrationBuilder.DropIndex(
                name: "IX_Payments_DispenseId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_ParentConsultationId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "DispenseId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "FollowUpType",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "ParentConsultationId",
                table: "Appointments");
        }
    }
}
