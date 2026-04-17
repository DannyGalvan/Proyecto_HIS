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
    /// Before creating an InventoryMovement, looks up the associated MedicineInventory,
    /// records PreviousStock, calculates NewStock based on MovementType, validates
    /// sufficient stock for exit movements, updates MedicineInventory.CurrentStock
    /// with optimistic locking, and calculates TotalCost.
    /// </summary>
    public class InventoryMovementBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<InventoryMovement, InventoryMovementRequest>
    {
        private readonly DataContext _db;

        // Entry movement types: Compra (0), Devolución_Proveedor (1), Ajuste_Positivo (4)
        private static readonly HashSet<int> EntryMovementTypes = new() { 0, 1, 4 };

        // Exit movement types: Venta (2), Reclamo (3), Ajuste_Negativo (5), Despacho (6)
        private static readonly HashSet<int> ExitMovementTypes = new() { 2, 3, 5, 6 };

        public InventoryMovementBeforeCreateInterceptor(DataContext db)
        {
            _db = db;
        }

        public Response<InventoryMovement, List<ValidationFailure>> Execute(
            Response<InventoryMovement, List<ValidationFailure>> response,
            InventoryMovementRequest request)
        {
            if (response.Data == null) return response;

            if (request.MedicineInventoryId == null || request.MedicineInventoryId <= 0)
            {
                response.Success = false;
                response.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("MedicineInventoryId",
                        "Debe especificar el inventario de medicamento.")
                };
                return response;
            }

            // Fetch the MedicineInventory record (tracked for update)
            var inventory = _db.MedicineInventories
                .FirstOrDefault(i => i.Id == request.MedicineInventoryId && i.State == 1);

            if (inventory == null)
            {
                response.Success = false;
                response.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("MedicineInventoryId",
                        "El inventario de medicamento especificado no existe o no está activo.")
                };
                return response;
            }

            var currentStock = inventory.CurrentStock;
            var quantity = response.Data.Quantity;
            int newStock;

            var movementType = response.Data.MovementType;

            if (EntryMovementTypes.Contains(movementType))
            {
                // Entry: increment stock
                newStock = currentStock + quantity;
            }
            else if (ExitMovementTypes.Contains(movementType))
            {
                // Exit: validate sufficient stock
                if (currentStock < quantity)
                {
                    response.Success = false;
                    response.Errors = new List<ValidationFailure>
                    {
                        new ValidationFailure("Quantity",
                            $"Stock insuficiente. Stock actual: {currentStock}, cantidad solicitada: {quantity}")
                    };
                    return response;
                }

                // Exit: decrement stock
                newStock = currentStock - quantity;
            }
            else
            {
                response.Success = false;
                response.Errors = new List<ValidationFailure>
                {
                    new ValidationFailure("MovementType",
                        $"Tipo de movimiento no válido: {movementType}")
                };
                return response;
            }

            // Set PreviousStock and NewStock on the entity
            response.Data.PreviousStock = currentStock;
            response.Data.NewStock = newStock;

            // Calculate TotalCost = UnitCost × Quantity
            response.Data.TotalCost = response.Data.UnitCost * quantity;

            // Update MedicineInventory.CurrentStock with optimistic locking
            // The RowVersion (xmin) is already loaded as the original value;
            // EF Core will include it in the WHERE clause on SaveChanges.
            inventory.CurrentStock = newStock;
            inventory.UpdatedAt = DateTime.UtcNow;

            return response;
        }
    }
}
