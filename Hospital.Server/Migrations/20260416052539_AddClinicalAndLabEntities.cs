using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Project.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddClinicalAndLabEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "AppointmentId",
                table: "Payments",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<long>(
                name: "LabOrderId",
                table: "Payments",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LabExams",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DefaultAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ReferenceRange = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LaboratoryId = table.Column<long>(type: "bigint", nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabExams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabExams_Laboratories_LaboratoryId",
                        column: x => x.LaboratoryId,
                        principalTable: "Laboratories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicalConsultations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AppointmentId = table.Column<long>(type: "bigint", nullable: false),
                    DoctorId = table.Column<long>(type: "bigint", nullable: false),
                    ReasonForVisit = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    ClinicalFindings = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    Diagnosis = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    DiagnosisCie10Code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    TreatmentPlan = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    ConsultationStatus = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalConsultations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicalConsultations_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalConsultations_Users_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VitalSigns",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AppointmentId = table.Column<long>(type: "bigint", nullable: false),
                    NurseId = table.Column<long>(type: "bigint", nullable: false),
                    BloodPressureSystolic = table.Column<int>(type: "integer", nullable: false),
                    BloodPressureDiastolic = table.Column<int>(type: "integer", nullable: false),
                    Temperature = table.Column<decimal>(type: "numeric(4,1)", precision: 4, scale: 1, nullable: false),
                    Weight = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Height = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    HeartRate = table.Column<int>(type: "integer", nullable: false),
                    IsEmergency = table.Column<bool>(type: "boolean", nullable: false),
                    ClinicalAlerts = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VitalSigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VitalSigns_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VitalSigns_Users_NurseId",
                        column: x => x.NurseId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LabOrders",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationId = table.Column<long>(type: "bigint", nullable: false),
                    DoctorId = table.Column<long>(type: "bigint", nullable: false),
                    PatientId = table.Column<long>(type: "bigint", nullable: false),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OrderStatus = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    IsExternal = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabOrders_MedicalConsultations_ConsultationId",
                        column: x => x.ConsultationId,
                        principalTable: "MedicalConsultations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrders_Users_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrders_Users_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultationId = table.Column<long>(type: "bigint", nullable: false),
                    DoctorId = table.Column<long>(type: "bigint", nullable: false),
                    PrescriptionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prescriptions_MedicalConsultations_ConsultationId",
                        column: x => x.ConsultationId,
                        principalTable: "MedicalConsultations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Users_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LabOrderItems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LabOrderId = table.Column<long>(type: "bigint", nullable: false),
                    LabExamId = table.Column<long>(type: "bigint", nullable: false),
                    ExamName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ResultValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ResultUnit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceRange = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsOutOfRange = table.Column<bool>(type: "boolean", nullable: false),
                    ResultNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ResultDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabOrderItems_LabExams_LabExamId",
                        column: x => x.LabExamId,
                        principalTable: "LabExams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrderItems_LabOrders_LabOrderId",
                        column: x => x.LabOrderId,
                        principalTable: "LabOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrescriptionItems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrescriptionId = table.Column<long>(type: "bigint", nullable: false),
                    MedicineName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Dosage = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Frequency = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Duration = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SpecialInstructions = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrescriptionItems_Prescriptions_PrescriptionId",
                        column: x => x.PrescriptionId,
                        principalTable: "Prescriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "LabExams",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "DefaultAmount", "Description", "LaboratoryId", "Name", "ReferenceRange", "State", "Unit", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 150.00m, "Análisis completo de células sanguíneas", null, "Hemograma Completo", "Varía por componente", 1, "Varios", null, null },
                    { 2L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 75.00m, "Medición de nivel de glucosa en sangre en ayunas", null, "Glucosa en Ayunas", "70-100 mg/dL", 1, "mg/dL", null, null },
                    { 3L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 200.00m, "Medición de colesterol total, HDL, LDL y triglicéridos", null, "Perfil Lipídico", "Colesterol <200 mg/dL", 1, "mg/dL", null, null },
                    { 4L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 60.00m, "Análisis físico, químico y microscópico de orina", null, "Examen General de Orina", "Varía por componente", 1, "Varios", null, null },
                    { 5L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 80.00m, "Evaluación de función renal", null, "Creatinina", "0.7-1.3 mg/dL", 1, "mg/dL", null, null },
                    { 6L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 85.00m, "Medición de niveles de ácido úrico en sangre", null, "Ácido Úrico", "3.4-7.0 mg/dL", 1, "mg/dL", null, null },
                    { 7L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 250.00m, "Evaluación de la función del hígado", null, "Perfil Hepático", "Varía por componente", 1, "Varios", null, null },
                    { 8L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 120.00m, "Hormona estimulante de tiroides", null, "TSH (Tiroides)", "0.4-4.0 mIU/L", 1, "mIU/L", null, null },
                    { 9L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 150.00m, "Control de diabetes a largo plazo (últimos 3 meses)", null, "Hemoglobina Glicosilada", "<5.7%", 1, "%", null, null },
                    { 10L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, 100.00m, "Detección rápida de antígenos SARS-CoV-2", null, "Prueba Rápida COVID-19", "Negativo", 1, "Cualitativo", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_LabOrderId",
                table: "Payments",
                column: "LabOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_LabExams_LaboratoryId",
                table: "LabExams",
                column: "LaboratoryId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrderItems_LabExamId",
                table: "LabOrderItems",
                column: "LabExamId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrderItems_LabOrderId",
                table: "LabOrderItems",
                column: "LabOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_ConsultationId",
                table: "LabOrders",
                column: "ConsultationId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_DoctorId",
                table: "LabOrders",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_OrderNumber",
                table: "LabOrders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_PatientId",
                table: "LabOrders",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalConsultations_AppointmentId",
                table: "MedicalConsultations",
                column: "AppointmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalConsultations_DoctorId",
                table: "MedicalConsultations",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionItems_PrescriptionId",
                table: "PrescriptionItems",
                column: "PrescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_ConsultationId",
                table: "Prescriptions",
                column: "ConsultationId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_DoctorId",
                table: "Prescriptions",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_AppointmentId",
                table: "VitalSigns",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_NurseId",
                table: "VitalSigns",
                column: "NurseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_LabOrders_LabOrderId",
                table: "Payments",
                column: "LabOrderId",
                principalTable: "LabOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_LabOrders_LabOrderId",
                table: "Payments");

            migrationBuilder.DropTable(
                name: "LabOrderItems");

            migrationBuilder.DropTable(
                name: "PrescriptionItems");

            migrationBuilder.DropTable(
                name: "VitalSigns");

            migrationBuilder.DropTable(
                name: "LabExams");

            migrationBuilder.DropTable(
                name: "LabOrders");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "MedicalConsultations");

            migrationBuilder.DropIndex(
                name: "IX_Payments_LabOrderId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "LabOrderId",
                table: "Payments");

            migrationBuilder.AlterColumn<long>(
                name: "AppointmentId",
                table: "Payments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);
        }
    }
}
