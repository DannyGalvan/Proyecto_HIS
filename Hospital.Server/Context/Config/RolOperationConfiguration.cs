using Hospital.Server.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hospital.Server.Context.Config
{
    public class RolOperationConfiguration : IEntityTypeConfiguration<RolOperation>
    {
        public void Configure(EntityTypeBuilder<RolOperation> entity)
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.HasOne(e => e.Rol)
                .WithMany(e => e.RolOperations)
                .HasForeignKey(e => e.RolId);

            entity.HasOne(e => e.Operation)
                .WithMany(e => e.RolOperations)
                .HasForeignKey(e => e.OperationId);

            // NOTE: Las asignaciones por defecto Rol -> Operation se siembran en runtime
            // por OperationSyncService.AssignDefaultPermissionsByRoleAsync() porque las
            // Operations se crean dinámicamente al escanear los controllers, así que sus
            // Ids no son estables para HasData. Ver Services/Core/OperationSyncService.cs.
        }
    }
}
