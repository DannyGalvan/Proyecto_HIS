using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Project.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCatalogsAndModuleVisibility : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppointmentStatuses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Branches",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branches", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Laboratories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Laboratories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Specialties",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Specialties", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AppointmentStatuses",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Description", "Name", "State", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Cita recién agendada, esperando confirmación de pago", "Pendiente de Pago", 1, null, null },
                    { 2L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Pago recibido, cita confirmada y lista para atención", "Confirmada", 1, null, null },
                    { 3L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Enfermero realizando toma de signos vitales al paciente", "Signos Vitales", 1, null, null },
                    { 4L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Paciente esperando turno para consulta médica", "En Espera", 1, null, null },
                    { 5L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Paciente en atención con el médico", "Consulta Médica", 1, null, null },
                    { 6L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Médico completó diagnóstico y plan de tratamiento", "Evaluado", 1, null, null },
                    { 7L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Paciente en proceso de exámenes de laboratorio", "Laboratorio", 1, null, null },
                    { 8L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Paciente en despacho de medicamentos", "Farmacia", 1, null, null },
                    { 9L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Ciclo de atención completo, paciente dado de alta", "Atención Finalizada", 1, null, null },
                    { 10L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "El paciente no se presentó a la cita programada", "No Asistió", 1, null, null },
                    { 11L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Cita cancelada por el paciente o el sistema", "Cancelada", 1, null, null }
                });

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "Id", "Address", "CreatedAt", "CreatedBy", "Description", "Name", "Phone", "State", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1L, "Ciudad de Guatemala, Zona 10", new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Sede principal del hospital", "Sede Central", "22345678", 1, null, null },
                    { 2L, "Ciudad de Guatemala, Zona 1", new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Sucursal centro histórico", "Sede Zona 1", "22345679", 1, null, null }
                });

            migrationBuilder.InsertData(
                table: "Laboratories",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Description", "Name", "State", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Laboratorio interno principal del hospital", "Laboratorio Central", 1, null, null },
                    { 2L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Laboratorio para análisis de emergencias", "Laboratorio de Urgencias", 1, null, null }
                });

            migrationBuilder.InsertData(
                table: "Specialties",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Description", "Name", "State", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Atención médica primaria y diagnóstico general", "Medicina General", 1, null, null },
                    { 2L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Atención médica para niños y adolescentes", "Pediatría", 1, null, null },
                    { 3L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Salud reproductiva y atención de la mujer", "Ginecología", 1, null, null },
                    { 4L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Diagnóstico y tratamiento de enfermedades del corazón", "Cardiología", 1, null, null },
                    { 5L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Diagnóstico y tratamiento de enfermedades de la piel", "Dermatología", 1, null, null },
                    { 6L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Lesiones del sistema musculoesquelético", "Traumatología", 1, null, null },
                    { 7L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Diagnóstico y tratamiento de enfermedades de los ojos", "Oftalmología", 1, null, null },
                    { 8L, new DateTime(2025, 2, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1L, "Diagnóstico y tratamiento de enfermedades del sistema nervioso", "Neurología", 1, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentStatuses");

            migrationBuilder.DropTable(
                name: "Branches");

            migrationBuilder.DropTable(
                name: "Laboratories");

            migrationBuilder.DropTable(
                name: "Specialties");
        }
    }
}
