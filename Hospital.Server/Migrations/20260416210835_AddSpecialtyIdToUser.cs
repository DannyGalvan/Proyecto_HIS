using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hospital.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSpecialtyIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SpecialtyId",
                table: "Users",
                type: "bigint",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1L,
                column: "SpecialtyId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Users_SpecialtyId",
                table: "Users",
                column: "SpecialtyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Specialties_SpecialtyId",
                table: "Users",
                column: "SpecialtyId",
                principalTable: "Specialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Specialties_SpecialtyId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_SpecialtyId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SpecialtyId",
                table: "Users");
        }
    }
}
