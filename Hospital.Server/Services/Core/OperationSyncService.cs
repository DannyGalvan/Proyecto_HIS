using Hospital.Server.Attributes;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Services.Core
{
    /// <summary>
    /// Servicio de sincronización automática de Módulos y Operaciones
    /// Usa reflexión para detectar controladores y acciones, y los sincroniza con la BD
    /// </summary>
    public class OperationSyncService : IOperationSyncService
    {
        private readonly DataContext _db;
        private readonly IActionDescriptorCollectionProvider _actionDescriptorProvider;
        private readonly ILogger<OperationSyncService> _logger;

        public OperationSyncService(
            DataContext db,
            IActionDescriptorCollectionProvider actionDescriptorProvider,
            ILogger<OperationSyncService> logger)
        {
            _db = db;
            _actionDescriptorProvider = actionDescriptorProvider;
            _logger = logger;
        }

        public async Task SyncAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando sincronización de operaciones...");

                // Obtener todas las acciones de los controladores
                var actions = _actionDescriptorProvider.ActionDescriptors.Items
                    .OfType<ControllerActionDescriptor>()
                    .Where(a => !IsExcludedController(a) && !IsExcludedAction(a))
                    .ToList();

                _logger.LogInformation("Total de acciones detectadas: {Count}", actions.Count);

                // Normalizar acciones y agrupar por clave única
                var normalizedActions = actions
                    .Select(a =>
                    {
                        var methods = a.ActionConstraints?
                            .OfType<HttpMethodActionConstraint>()
                            .FirstOrDefault()?
                            .HttpMethods
                            ?.Distinct(StringComparer.OrdinalIgnoreCase)
                            .ToList() ?? new List<string>();

                        var method = methods.Count > 0 ? string.Join("_", methods).ToUpperInvariant() : "ANY";
                        var key = $"{a.ControllerName}.{a.ActionName}.{method}";

                        return new
                        {
                            Key = key,
                            ControllerName = a.ControllerName,
                            ActionName = a.ActionName,
                            HttpMethod = method,
                            RouteTemplate = a.AttributeRouteInfo?.Template ?? string.Empty,
                            ControllerType = a.ControllerTypeInfo,
                            MethodInfo = a.MethodInfo
                        };
                    })
                    .GroupBy(x => x.Key, StringComparer.OrdinalIgnoreCase)
                    .Select(g => g.First())
                    .ToList();

                _logger.LogInformation("Acciones normalizadas: {Count}", normalizedActions.Count);

                // Cargar módulos y operaciones existentes
                var modules = await _db.Modules.ToListAsync();
                var operations = await _db.Operations.ToListAsync();

                // Procesar cada acción
                foreach (var action in normalizedActions)
                {
                    // Obtener o crear el módulo
                    var module = modules.FirstOrDefault(m => m.Name == action.ControllerName);
                    if (module == null)
                    {
                        var moduleInfo = action.ControllerType.GetCustomAttributes(typeof(ModuleInfoAttribute), false)
                            .FirstOrDefault() as ModuleInfoAttribute;

                        module = new Module
                        {
                            Name = action.ControllerName,
                            DisplayName = moduleInfo?.DisplayName ?? action.ControllerName,
                            Description = moduleInfo?.Description ?? $"Módulo {action.ControllerName}",
                            Image = moduleInfo?.Icon ?? "folder",
                            Path = moduleInfo?.Path ?? action.ControllerName,
                            State = 1,
                            Order = moduleInfo?.Order ?? 0,
                            CreatedBy = 1,
                            CreatedAt = DateTime.UtcNow,
                            IsVisible = moduleInfo?.IsVisible ?? false
                        };

                        _db.Modules.Add(module);
                        modules.Add(module);
                        await _db.SaveChangesAsync();

                        _logger.LogInformation("Módulo creado: {ModuleName}", module.Name);
                    }
                    else
                    {
                        // Actualizar módulo existente con metadata de atributo
                        var moduleInfo = action.ControllerType.GetCustomAttributes(typeof(ModuleInfoAttribute), false)
                            .FirstOrDefault() as ModuleInfoAttribute;

                        if (moduleInfo != null)
                        {
                            module.DisplayName = moduleInfo.DisplayName ?? action.ControllerName;
                            module.Description = moduleInfo.Description;
                            module.Image = moduleInfo.Icon;
                            module.Path = moduleInfo.Path;
                            module.Order = moduleInfo.Order;
                            module.UpdatedBy = 1;
                            module.UpdatedAt = DateTime.UtcNow;
                            module.IsVisible = moduleInfo.IsVisible;
                        }
                    }

                    // Obtener metadata de la operación
                    var operationInfo = action.MethodInfo.GetCustomAttributes(typeof(OperationInfoAttribute), false)
                        .FirstOrDefault() as OperationInfoAttribute;

                    // Generar datos de la operación
                    var key = action.Key;
                    var displayName = operationInfo?.DisplayName ?? $"{action.ControllerName} - {action.ActionName}";
                    var description = operationInfo?.Description ?? $"{action.ActionName} en {action.ControllerName}";
                    var icon = operationInfo?.Icon ?? "circle";
                    var path = operationInfo?.Path ?? $"{action.ControllerName}/{action.ActionName}";
                    var isVisible = operationInfo?.IsVisible ?? false;
                    var policy = $"{action.ControllerName}.{action.ActionName}";

                    // Buscar operación existente
                    var existingOperation = operations.FirstOrDefault(o => o.OperationKey == key);

                    if (existingOperation == null)
                    {
                        // Crear nueva operación
                        var operation = new Operation
                        {
                            ModuleId = module.Id,
                            OperationKey = key,
                            Guid = System.Guid.NewGuid().ToString(),
                            Name = displayName,
                            Description = description,
                            Policy = policy,
                            Icon = icon,
                            Path = path,
                            ControllerName = action.ControllerName,
                            ActionName = action.ActionName,
                            HttpMethod = action.HttpMethod,
                            RouteTemplate = action.RouteTemplate,
                            IsVisible = isVisible,
                            State = 1,
                            CreatedBy = 1,
                            CreatedAt = DateTime.UtcNow
                        };

                        _db.Operations.Add(operation);
                        operations.Add(operation);

                        _logger.LogInformation("Operación creada: {OperationKey}", key);
                    }
                    else
                    {
                        // Actualizar operación existente
                        existingOperation.ModuleId = module.Id;
                        existingOperation.Name = displayName;
                        existingOperation.Description = description;
                        existingOperation.Policy = policy;
                        existingOperation.Icon = icon;
                        existingOperation.Path = path;
                        existingOperation.ControllerName = action.ControllerName;
                        existingOperation.ActionName = action.ActionName;
                        existingOperation.HttpMethod = action.HttpMethod;
                        existingOperation.RouteTemplate = action.RouteTemplate;
                        existingOperation.IsVisible = isVisible;
                        existingOperation.State = 1;
                        existingOperation.UpdatedBy = 1;
                        existingOperation.UpdatedAt = DateTime.UtcNow;

                        _logger.LogDebug("Operación actualizada: {OperationKey}", key);
                    }
                }

                await _db.SaveChangesAsync();

                // Asignar todas las operaciones al rol SA
                await AssignAllOperationsToAdminRoleAsync();

                _logger.LogInformation("Sincronización completada. Total de operaciones: {Count}", await _db.Operations.CountAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la sincronización de operaciones");
                throw;
            }
        }

        public async Task AssignAllOperationsToAdminRoleAsync(string roleName = "SA")
        {
            try
            {
                _logger.LogInformation("Asignando operaciones al rol: {RoleName}", roleName);

                // Buscar el rol
                var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
                if (role == null)
                {
                    _logger.LogWarning("Rol {RoleName} no encontrado. No se asignarán operaciones.", roleName);
                    return;
                }

                // Obtener todas las operaciones activas
                var operations = await _db.Operations.Where(o => o.State == 1).ToListAsync();

                // Obtener las asignaciones existentes
                var existingAssignments = await _db.RolOperations
                    .Where(ro => ro.RolId == role.Id)
                    .ToListAsync();

                var existingOperationIds = existingAssignments.Select(ro => ro.OperationId).ToHashSet();

                // Crear asignaciones faltantes
                var newAssignments = operations
                    .Where(o => !existingOperationIds.Contains(o.Id))
                    .Select(o => new RolOperation
                    {
                        RolId = role.Id,
                        OperationId = o.Id,
                        State = 1,
                        CreatedBy = 1,
                        CreatedAt = DateTime.UtcNow
                    })
                    .ToList();

                if (newAssignments.Any())
                {
                    _db.RolOperations.AddRange(newAssignments);
                    await _db.SaveChangesAsync();
                    _logger.LogInformation("Se asignaron {Count} nuevas operaciones al rol {RoleName}", newAssignments.Count, roleName);
                }
                else
                {
                    _logger.LogInformation("No hay nuevas operaciones para asignar al rol {RoleName}", roleName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al asignar operaciones al rol {RoleName}", roleName);
                throw;
            }
        }

        public async Task AssignDefaultPermissionsByRoleAsync()
        {
            try
            {
                _logger.LogInformation("Asignando permisos por defecto a roles no-SA...");

                // Matriz Rol -> (OperationKey, IsVisible).
                // Política: "por módulo lógico" — IsVisible=true solo en módulos que el rol gestiona;
                // false para operaciones otorgadas como lookup/lectura cross-module (no aparecen en el menú).
                // Si una OperationKey no existe en BD (controller renombrado/quitado) se ignora con un continue.
                var matrix = new Dictionary<string, List<(string OperationKey, bool IsVisible)>>
                {
                ["Paciente"] = new List<(string OperationKey, bool IsVisible)>
                {
                    ("Auth.PostResetPassword.POST",                   false),
                    ("PatientPortal.BookAppointment.POST",             true),
                    ("PatientPortal.ProcessPayment.POST",              true),
                    ("PatientPortal.GetMyAppointments.GET",            true),
                    ("Payment.Get.GET",                               false),
                    ("Prescription.Get.GET",                          false),
                    ("PrescriptionItem.Get.GET",                      false),
                    ("Prescription.GetByConsultation.GET",            false),
                    ("Auth.ManualChangePassword.POST",                false),
                },
                ["Medico"] = new List<(string OperationKey, bool IsVisible)>
                {
                    ("Auth.PostResetPassword.POST",                   false),
                    ("Appointment.GetAll.GET",                         true),
                    ("Appointment.Get.GET",                            true),
                    ("Appointment.Update.PUT",                         true),
                    ("Appointment.PartialUpdate.PATCH",                true),
                    ("AppointmentDocument.GetAll.GET",                 true),
                    ("AppointmentDocument.Get.GET",                    true),
                    ("AppointmentDocument.Create.POST",                true),
                    ("AppointmentDocument.Update.PUT",                 true),
                    ("AppointmentDocument.PartialUpdate.PATCH",        true),
                    ("AppointmentDocument.Delete.DELETE",              true),
                    ("AppointmentStatus.GetAll.GET",                  false),
                    ("AppointmentStatus.Get.GET",                     false),
                    ("Branch.GetAll.GET",                             false),
                    ("Branch.Get.GET",                                false),
                    ("LabExam.GetAll.GET",                            false),
                    ("LabExam.Get.GET",                               false),
                    ("LabOrder.GetAll.GET",                            true),
                    ("LabOrder.Get.GET",                               true),
                    ("LabOrder.Create.POST",                           true),
                    ("LabOrder.Update.PUT",                            true),
                    ("LabOrder.PartialUpdate.PATCH",                   true),
                    ("LabOrder.Delete.DELETE",                         true),
                    ("LabOrderItem.GetAll.GET",                        true),
                    ("LabOrderItem.Get.GET",                           true),
                    ("LabOrderItem.Create.POST",                       true),
                    ("LabOrderItem.Update.PUT",                        true),
                    ("LabOrderItem.PartialUpdate.PATCH",               true),
                    ("MedicalConsultation.GetAll.GET",                 true),
                    ("MedicalConsultation.Get.GET",                    true),
                    ("MedicalConsultation.Create.POST",                true),
                    ("MedicalConsultation.Update.PUT",                 true),
                    ("MedicalConsultation.PartialUpdate.PATCH",        true),
                    ("Medicine.GetAll.GET",                           false),
                    ("Medicine.Get.GET",                              false),
                    ("NotificationLog.Get.GET",                       false),
                    ("NotificationLog.Create.POST",                   false),
                    ("Prescription.GetAll.GET",                        true),
                    ("Prescription.Get.GET",                           true),
                    ("Prescription.Create.POST",                       true),
                    ("Prescription.Update.PUT",                        true),
                    ("Prescription.PartialUpdate.PATCH",               true),
                    ("PrescriptionItem.GetAll.GET",                    true),
                    ("PrescriptionItem.Get.GET",                       true),
                    ("PrescriptionItem.Create.POST",                   true),
                    ("PrescriptionItem.Update.PUT",                    true),
                    ("PrescriptionItem.PartialUpdate.PATCH",           true),
                    ("PrescriptionItem.Delete.DELETE",                 true),
                    ("Specialty.GetAll.GET",                          false),
                    ("Specialty.Get.GET",                             false),
                    ("User.Get.GET",                                  false),
                    ("VitalSign.GetAll.GET",                           true),
                    ("VitalSign.Get.GET",                              true),
                    ("VitalSign.Create.POST",                          true),
                    ("VitalSign.Update.PUT",                           true),
                    ("VitalSign.PartialUpdate.PATCH",                  true),
                    ("Prescription.CreateWithItems.POST",              true),
                    ("Prescription.GetByConsultation.GET",             true),
                    ("Auth.ManualChangePassword.POST",                false),
                    ("DoctorEvent.GetAll.GET",                         true),
                    ("DoctorEvent.Get.GET",                            true),
                    ("DoctorEvent.Create.POST",                        true),
                    ("DoctorEvent.Update.PUT",                         true),
                    ("DoctorEvent.PartialUpdate.PATCH",                true),
                    ("DoctorTask.GetAll.GET",                          true),
                    ("DoctorTask.Get.GET",                             true),
                    ("DoctorTask.Create.POST",                         true),
                    ("DoctorTask.Update.PUT",                          true),
                    ("DoctorTask.PartialUpdate.PATCH",                 true),
                    ("Timezone.GetAll.GET",                           false),
                    ("Timezone.Get.GET",                              false),
                },
                ["Enfermero"] = new List<(string OperationKey, bool IsVisible)>
                {
                    ("Auth.PostResetPassword.POST",                   false),
                    ("Appointment.GetAll.GET",                        false),
                    ("Appointment.Get.GET",                           false),
                    ("Appointment.PartialUpdate.PATCH",               false),
                    ("AppointmentDocument.GetAll.GET",                 true),
                    ("AppointmentDocument.Get.GET",                    true),
                    ("AppointmentDocument.Create.POST",                true),
                    ("AppointmentDocument.Update.PUT",                 true),
                    ("AppointmentDocument.PartialUpdate.PATCH",        true),
                    ("AppointmentStatus.GetAll.GET",                  false),
                    ("AppointmentStatus.Get.GET",                     false),
                    ("Branch.GetAll.GET",                             false),
                    ("Branch.Get.GET",                                false),
                    ("MedicalConsultation.GetAll.GET",                false),
                    ("MedicalConsultation.Get.GET",                   false),
                    ("NotificationLog.GetAll.GET",                    false),
                    ("NotificationLog.Get.GET",                       false),
                    ("NotificationLog.Create.POST",                   false),
                    ("VitalSign.GetAll.GET",                           true),
                    ("VitalSign.Get.GET",                              true),
                    ("VitalSign.Create.POST",                          true),
                    ("VitalSign.Update.PUT",                           true),
                    ("VitalSign.PartialUpdate.PATCH",                  true),
                    ("Auth.ManualChangePassword.POST",                false),
                    ("Timezone.GetAll.GET",                           false),
                    ("Timezone.Get.GET",                              false),
                },
                ["Recepcionista"] = new List<(string OperationKey, bool IsVisible)>
                {
                    ("Auth.PostResetPassword.POST",                   false),
                    ("Appointment.GetAll.GET",                         true),
                    ("Appointment.Get.GET",                            true),
                    ("Appointment.Create.POST",                        true),
                    ("Appointment.Update.PUT",                         true),
                    ("Appointment.PartialUpdate.PATCH",                true),
                    ("Appointment.Delete.DELETE",                      true),
                    ("AppointmentDocument.GetAll.GET",                 true),
                    ("AppointmentDocument.Get.GET",                    true),
                    ("AppointmentDocument.Create.POST",                true),
                    ("AppointmentDocument.Update.PUT",                 true),
                    ("AppointmentDocument.PartialUpdate.PATCH",        true),
                    ("AppointmentDocument.Delete.DELETE",              true),
                    ("AppointmentStatus.GetAll.GET",                   true),
                    ("AppointmentStatus.Get.GET",                      true),
                    ("AppointmentStatus.Create.POST",                  true),
                    ("AppointmentStatus.Update.PUT",                   true),
                    ("AppointmentStatus.PartialUpdate.PATCH",          true),
                    ("AppointmentStatus.Delete.DELETE",                true),
                    ("Branch.GetAll.GET",                             false),
                    ("Branch.Get.GET",                                false),
                    ("NotificationLog.GetAll.GET",                     true),
                    ("NotificationLog.Get.GET",                        true),
                    ("NotificationLog.Create.POST",                    true),
                    ("NotificationLog.Update.PUT",                     true),
                    ("NotificationLog.PartialUpdate.PATCH",            true),
                    ("NotificationLog.Delete.DELETE",                  true),
                    ("Specialty.GetAll.GET",                          false),
                    ("Specialty.Get.GET",                             false),
                    ("User.GetAll.GET",                               false),
                    ("User.Get.GET",                                  false),
                    ("BranchSpecialty.GetAll.GET",                     true),
                    ("BranchSpecialty.Get.GET",                        true),
                    ("Auth.ManualChangePassword.POST",                false),
                    ("DoctorEvent.GetAll.GET",                        false),
                    ("DoctorEvent.Get.GET",                           false),
                    ("DoctorTask.GetAll.GET",                         false),
                    ("DoctorTask.Get.GET",                            false),
                    ("Timezone.GetAll.GET",                           false),
                    ("Timezone.Get.GET",                              false),
                },
                ["Cajero"] = new List<(string OperationKey, bool IsVisible)>
                {
                    ("Auth.PostResetPassword.POST",                   false),
                    ("Appointment.GetAll.GET",                        false),
                    ("Appointment.Get.GET",                           false),
                    ("AppointmentStatus.GetAll.GET",                  false),
                    ("AppointmentStatus.Get.GET",                     false),
                    ("Branch.GetAll.GET",                             false),
                    ("Branch.Get.GET",                                false),
                    ("LabOrder.GetAll.GET",                           false),
                    ("LabOrder.Get.GET",                              false),
                    ("NotificationLog.GetAll.GET",                    false),
                    ("NotificationLog.Get.GET",                       false),
                    ("NotificationLog.Create.POST",                   false),
                    ("Payment.GetAll.GET",                             true),
                    ("Payment.Get.GET",                                true),
                    ("Payment.Create.POST",                            true),
                    ("Payment.Update.PUT",                             true),
                    ("Payment.PartialUpdate.PATCH",                    true),
                    ("Payment.Delete.DELETE",                          true),
                    ("Prescription.GetAll.GET",                       false),
                    ("Prescription.Get.GET",                          false),
                    ("User.GetAll.GET",                               false),
                    ("User.Get.GET",                                  false),
                    ("Auth.ManualChangePassword.POST",                false),
                    ("Payment.GetPendingOrders.GET",                   true),
                    ("Timezone.GetAll.GET",                           false),
                    ("Timezone.Get.GET",                              false),
                },
                ["Farmaceutico"] = new List<(string OperationKey, bool IsVisible)>
                {
                    ("Auth.PostResetPassword.POST",                   false),
                    ("Branch.GetAll.GET",                             false),
                    ("Branch.Get.GET",                                false),
                    ("Dispense.GetAll.GET",                            true),
                    ("Dispense.Get.GET",                               true),
                    ("Dispense.SelectPrescription.GET",                false),
                    ("Dispense.Create.POST",                           true),
                    ("Dispense.Update.PUT",                            true),
                    ("Dispense.PartialUpdate.PATCH",                   true),
                    ("Dispense.Delete.DELETE",                         true),
                    ("DispenseItem.GetAll.GET",                        true),
                    ("DispenseItem.Get.GET",                           true),
                    ("DispenseItem.Create.POST",                       true),
                    ("DispenseItem.Update.PUT",                        true),
                    ("DispenseItem.PartialUpdate.PATCH",               true),
                    ("DispenseItem.Delete.DELETE",                     true),
                    ("Medicine.GetAll.GET",                            true),
                    ("Medicine.Get.GET",                               true),
                    ("Medicine.Create.POST",                           true),
                    ("Medicine.Update.PUT",                            true),
                    ("Medicine.PartialUpdate.PATCH",                   true),
                    ("Medicine.Delete.DELETE",                         true),
                    ("MedicineInventory.GetAll.GET",                   true),
                    ("MedicineInventory.Get.GET",                      true),
                    ("MedicineInventory.Create.POST",                  true),
                    ("MedicineInventory.Update.PUT",                   true),
                    ("MedicineInventory.PartialUpdate.PATCH",          true),
                    ("MedicineInventory.Delete.DELETE",                true),
                    ("NotificationLog.GetAll.GET",                    false),
                    ("NotificationLog.Get.GET",                       false),
                    ("NotificationLog.Create.POST",                   false),
                    ("Prescription.GetAll.GET",                       false),
                    ("Prescription.Get.GET",                          false),
                    ("PrescriptionItem.GetAll.GET",                   false),
                    ("PrescriptionItem.Get.GET",                      false),
                    ("Auth.ManualChangePassword.POST",                false),
                    ("InventoryMovement.GetAll.GET",                   true),
                    ("InventoryMovement.Get.GET",                      true),
                    ("InventoryMovement.Create.POST",                  true),
                    ("InventoryMovement.Update.PUT",                   true),
                    ("InventoryMovement.PartialUpdate.PATCH",          true),
                    ("InventoryMovement.Delete.DELETE",                true),
                    ("Timezone.GetAll.GET",                           false),
                    ("Timezone.Get.GET",                              false),
                },
                ["Laboratorista"] = new List<(string OperationKey, bool IsVisible)>
                {
                    ("Auth.PostResetPassword.POST",                   false),
                    ("Appointment.GetAll.GET",                        false),
                    ("Appointment.Get.GET",                           false),
                    ("AppointmentStatus.GetAll.GET",                  false),
                    ("AppointmentStatus.Get.GET",                     false),
                    ("Branch.GetAll.GET",                             false),
                    ("Branch.Get.GET",                                false),
                    ("LabExam.GetAll.GET",                             true),
                    ("LabExam.Get.GET",                                true),
                    ("LabExam.Create.POST",                            true),
                    ("LabExam.Update.PUT",                             true),
                    ("LabExam.PartialUpdate.PATCH",                    true),
                    ("LabExam.Delete.DELETE",                          true),
                    ("Laboratory.GetAll.GET",                          true),
                    ("Laboratory.Get.GET",                             true),
                    ("Laboratory.Create.POST",                         true),
                    ("Laboratory.Update.PUT",                          true),
                    ("Laboratory.PartialUpdate.PATCH",                 true),
                    ("Laboratory.Delete.DELETE",                       true),
                    ("LabOrder.GetAll.GET",                            true),
                    ("LabOrder.Get.GET",                               true),
                    ("LabOrder.Create.POST",                           true),
                    ("LabOrder.Update.PUT",                            true),
                    ("LabOrder.PartialUpdate.PATCH",                   true),
                    ("LabOrder.Delete.DELETE",                         true),
                    ("LabOrderItem.GetAll.GET",                        true),
                    ("LabOrderItem.Get.GET",                           true),
                    ("LabOrderItem.Create.POST",                       true),
                    ("LabOrderItem.Update.PUT",                        true),
                    ("LabOrderItem.PartialUpdate.PATCH",               true),
                    ("LabOrderItem.Delete.DELETE",                     true),
                    ("NotificationLog.GetAll.GET",                    false),
                    ("NotificationLog.Get.GET",                       false),
                    ("NotificationLog.Create.POST",                   false),
                    ("Auth.ManualChangePassword.POST",                false),
                    ("Timezone.GetAll.GET",                           false),
                    ("Timezone.Get.GET",                              false),
                },
                };

                // Cache: operaciones por OperationKey
                var opsByKey = await _db.Operations
                    .Where(o => o.State == 1)
                    .ToDictionaryAsync(o => o.OperationKey, o => o);

                int assignmentsCreated = 0;
                int assignmentsUpdated = 0;
                int operationsMissing = 0;

                foreach (var entry in matrix)
                {
                    var roleName = entry.Key;
                    var ops = entry.Value;

                    var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
                    if (role == null)
                    {
                        _logger.LogWarning("Rol {RoleName} no encontrado al sembrar permisos por defecto.", roleName);
                        continue;
                    }

                    // Cargar asignaciones existentes para este rol
                    var existing = await _db.RolOperations
                        .Where(ro => ro.RolId == role.Id)
                        .ToDictionaryAsync(ro => ro.OperationId);

                    foreach (var (opKey, isVisible) in ops)
                    {
                        if (!opsByKey.TryGetValue(opKey, out var op))
                        {
                            _logger.LogDebug(
                                "OperationKey {OperationKey} no existe en BD (¿controller removido?). Skip para rol {RoleName}.",
                                opKey, roleName);
                            operationsMissing++;
                            continue;
                        }

                        if (existing.TryGetValue(op.Id, out var ro))
                        {
                            // Existe la asignación: solo actualiza IsVisible si difiere
                            if (ro.IsVisible != isVisible)
                            {
                                ro.IsVisible = isVisible;
                                ro.UpdatedAt = DateTime.UtcNow;
                                ro.UpdatedBy = 1;
                                assignmentsUpdated++;
                            }
                        }
                        else
                        {
                            _db.RolOperations.Add(new RolOperation
                            {
                                RolId = role.Id,
                                OperationId = op.Id,
                                IsVisible = isVisible,
                                State = 1,
                                CreatedBy = 1,
                                CreatedAt = DateTime.UtcNow
                            });
                            assignmentsCreated++;
                        }
                    }
                }

                if (assignmentsCreated > 0 || assignmentsUpdated > 0)
                {
                    await _db.SaveChangesAsync();
                }

                _logger.LogInformation(
                    "Permisos por defecto procesados. Creadas: {Created}, Actualizadas: {Updated}, Operations no encontradas: {Missing}.",
                    assignmentsCreated, assignmentsUpdated, operationsMissing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al sembrar permisos por defecto a roles no-SA");
                throw;
            }
        }

        /// <summary>
        /// Verifica si el controlador está excluido de la sincronización
        /// </summary>
        private bool IsExcludedController(ControllerActionDescriptor descriptor)
        {
            return descriptor.ControllerTypeInfo
                .GetCustomAttributes(typeof(ExcludeFromSyncAttribute), false)
                .Any();
        }

        /// <summary>
        /// Verifica si la acción está excluida de la sincronización
        /// </summary>
        private bool IsExcludedAction(ControllerActionDescriptor descriptor)
        {
            return descriptor.MethodInfo
                .GetCustomAttributes(typeof(ExcludeFromSyncAttribute), false)
                .Any() ||
                descriptor.MethodInfo
                .GetCustomAttributes(typeof(OperationInfoAttribute), false)
                .OfType<OperationInfoAttribute>()
                .Any(attr => attr.ExcludeFromSync);
        }
    }
}
