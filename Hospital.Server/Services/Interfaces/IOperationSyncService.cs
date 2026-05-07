namespace Hospital.Server.Services.Interfaces
{
    /// <summary>
    /// Servicio para sincronizar automáticamente Módulos y Operaciones desde los controladores
    /// usando reflexión y atributos personalizados
    /// </summary>
    public interface IOperationSyncService
    {
        /// <summary>
        /// Sincroniza todos los módulos y operaciones detectados en los controladores con la base de datos
        /// </summary>
        /// <returns>Task completado</returns>
        Task SyncAsync();

        /// <summary>
        /// Asigna todas las operaciones activas al rol especificado (por defecto SA - Super Administrador)
        /// </summary>
        /// <param name="roleName">Nombre del rol al que se asignarán las operaciones</param>
        /// <returns>Task completado</returns>
        Task AssignAllOperationsToAdminRoleAsync(string roleName = "SA");

        /// <summary>
        /// Asigna las operaciones por defecto a cada rol no-SA basándose en una matriz
        /// hardcodeada de OperationKey -> IsVisible. Se ejecuta después de SyncAsync()
        /// para que las Operations ya existan en la BD. Idempotente: solo crea
        /// asignaciones faltantes y actualiza IsVisible si difiere de la matriz.
        /// </summary>
        /// <returns>Task completado</returns>
        Task AssignDefaultPermissionsByRoleAsync();
    }
}
