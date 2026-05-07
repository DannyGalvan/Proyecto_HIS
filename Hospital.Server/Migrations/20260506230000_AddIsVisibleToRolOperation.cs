using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hospital.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddIsVisibleToRolOperation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Schema: agregar columna IsVisible con default true.
            // No se inicializan filas aquí: las asignaciones Rol->Operation (con su IsVisible
            // correspondiente) se siembran en runtime por
            // OperationSyncService.AssignDefaultPermissionsByRoleAsync() después de SyncAsync().
            migrationBuilder.AddColumn<bool>(
                name: "IsVisible",
                table: "RolOperations",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVisible",
                table: "RolOperations");
        }
    }
}
