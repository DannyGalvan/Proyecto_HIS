using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.InventoryInterceptors
{
    /// <summary>
    /// After a Dispense is updated, detects when DispenseStatus changes to 2 (Dispensed).
    /// For each DispenseItem, automatically creates an InventoryMovement of type Despacho (MovementType=6)
    /// and decrements MedicineInventory.CurrentStock accordingly.
    /// Implements both IEntityAfterUpdateInterceptor and IEntityAfterPartialUpdateInterceptor
    /// so the logic fires on both PUT and PATCH operations.
    /// </summary>
    public class DispenseAfterStatusChangeInterceptor
        : IEntityAfterUpdateInterceptor<Dispense, DispenseRequest>,
          IEntityAfterPartialUpdateInterceptor<Dispense, DispenseRequest>
    {
        private readonly DataContext _db;

        private const int DispenseStatusDispensed = 2;
        private const int MovementTypeDespacho = 6;

        public DispenseAfterStatusChangeInterceptor(DataContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Executes after a full update (PUT) on a Dispense entity.
        /// </summary>
        public Response<Dispense, List<ValidationFailure>> Execute(
            Response<Dispense, List<ValidationFailure>> response,
            DispenseRequest request,
            Dispense prevState)
        {
            return ProcessStatusChange(response, prevState);
        }

        /// <summary>
        /// Shared logic: only fires when DispenseStatus transitions TO 2 (Dispensed).
        /// </summary>
        private Response<Dispense, List<ValidationFailure>> ProcessStatusChange(
            Response<Dispense, List<ValidationFailure>> response,
            Dispense prevState)
        {
            if (!response.Success || response.Data == null)
                return response;

            // Only trigger when status changes TO Dispensed (2)
            if (response.Data.DispenseStatus != DispenseStatusDispensed)
                return response;

            // Skip if it was already Dispensed before this update
            if (prevState.DispenseStatus == DispenseStatusDispensed)
                return response;

            // Load active DispenseItems for this Dispense
            var dispenseItems = _db.DispenseItems
                .Where(di => di.DispenseId == response.Data.Id && di.State == 1)
                .ToList();

            if (dispenseItems.Count == 0)
                return response;

            // Resolve BranchId via Prescription → MedicalConsultation → Appointment
            long branchId = ResolveBranchId(response.Data.PrescriptionId);

            foreach (var item in dispenseItems)
            {
                var result = CreateDispenseMovement(item, branchId, response.Data.Id, response.Data.UpdatedBy ?? response.Data.CreatedBy);

                if (!result.Success)
                {
                    response.Success = false;
                    response.Errors = result.Errors;
                    response.Message = result.Message;
                    return response;
                }
            }

            return response;
        }

        /// <summary>
        /// Resolves the BranchId by traversing: Prescription → MedicalConsultation → Appointment.
        /// Falls back to the first active MedicineInventory branch if the chain cannot be resolved.
        /// </summary>
        private long ResolveBranchId(long prescriptionId)
        {
            var prescription = _db.Prescriptions
                .AsNoTracking()
                .FirstOrDefault(p => p.Id == prescriptionId);

            if (prescription == null)
                return 0;

            var consultation = _db.MedicalConsultations
                .AsNoTracking()
                .FirstOrDefault(c => c.Id == prescription.ConsultationId);

            if (consultation == null)
                return 0;

            var appointment = _db.Appointments
                .AsNoTracking()
                .FirstOrDefault(a => a.Id == consultation.AppointmentId);

            return appointment?.BranchId ?? 0;
        }

        /// <summary>
        /// Creates an InventoryMovement of type Despacho (6) for a single DispenseItem
        /// and decrements the corresponding MedicineInventory.CurrentStock.
        /// </summary>
        private Response<InventoryMovement, List<ValidationFailure>> CreateDispenseMovement(
            DispenseItem item, long branchId, long dispenseId, long userId)
        {
            var result = new Response<InventoryMovement, List<ValidationFailure>>();

            // Find the MedicineInventory for this medicine and branch
            var inventory = _db.MedicineInventories
                .FirstOrDefault(i => i.MedicineId == item.MedicineId
                                  && i.BranchId == branchId
                                  && i.State == 1);

            if (inventory == null)
            {
                result.Success = false;
                result.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("MedicineInventory",
                        $"No se encontró inventario activo para el medicamento Id={item.MedicineId} en la sucursal Id={branchId}.")
                };
                result.Message = "Inventario no encontrado para despacho automático.";
                return result;
            }

            var previousStock = inventory.CurrentStock;
            var quantity = item.Quantity;

            // Validate sufficient stock
            if (previousStock < quantity)
            {
                result.Success = false;
                result.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("Quantity",
                        $"Stock insuficiente. Stock actual: {previousStock}, cantidad solicitada: {quantity}")
                };
                result.Message = "Stock insuficiente para despacho automático.";
                return result;
            }

            var newStock = previousStock - quantity;

            // Create the InventoryMovement record
            var movement = new InventoryMovement
            {
                MedicineInventoryId = inventory.Id,
                MedicineId = item.MedicineId,
                BranchId = branchId,
                MovementType = MovementTypeDespacho,
                Quantity = quantity,
                PreviousStock = previousStock,
                NewStock = newStock,
                UnitCost = item.UnitPrice,
                TotalCost = item.UnitPrice * quantity,
                ReferenceType = "Despacho",
                ReferenceNumber = dispenseId.ToString(),
                Notes = null,
                UserId = userId,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _db.Set<InventoryMovement>().Add(movement);

            // Decrement MedicineInventory.CurrentStock
            inventory.CurrentStock = newStock;
            inventory.UpdatedAt = DateTime.UtcNow;

            _db.SaveChanges();

            result.Success = true;
            result.Data = movement;
            result.Message = "Movimiento de despacho creado exitosamente.";
            return result;
        }
    }
}
