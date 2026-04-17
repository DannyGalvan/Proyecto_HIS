using Hospital.Server.Entities.Interfaces;

namespace Hospital.Server.Entities.Models
{
    /// <summary>
    /// Represents a movement (entry or exit) in the pharmacy inventory.
    /// Tracks every stock change with full audit trail for traceability.
    /// MovementType enum: 0=Compra, 1=Devolución_Proveedor, 2=Venta, 3=Reclamo,
    /// 4=Ajuste_Positivo, 5=Ajuste_Negativo, 6=Despacho.
    /// </summary>
    public class InventoryMovement : IEntity<long>
    {
        /// <summary>
        /// Gets or sets the unique identifier for the inventory movement.
        /// </summary>
        public long Id { get; set; }

        /// <summary>
        /// FK to MedicineInventory — the inventory record affected by this movement.
        /// </summary>
        public long MedicineInventoryId { get; set; }

        /// <summary>
        /// FK to Medicine — the medicine involved in this movement.
        /// </summary>
        public long MedicineId { get; set; }

        /// <summary>
        /// FK to Branch — the branch where this movement occurred.
        /// </summary>
        public long BranchId { get; set; }

        /// <summary>
        /// Type of inventory movement.
        /// 0=Compra, 1=Devolución_Proveedor, 2=Venta, 3=Reclamo,
        /// 4=Ajuste_Positivo, 5=Ajuste_Negativo, 6=Despacho.
        /// </summary>
        public int MovementType { get; set; }

        /// <summary>
        /// Quantity of units moved (always positive).
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// Stock level before this movement was applied.
        /// </summary>
        public int PreviousStock { get; set; }

        /// <summary>
        /// Stock level after this movement was applied.
        /// </summary>
        public int NewStock { get; set; }

        /// <summary>
        /// Unit cost of the movement (precision 10,2).
        /// </summary>
        public decimal UnitCost { get; set; }

        /// <summary>
        /// Total cost of the movement (UnitCost × Quantity, precision 10,2).
        /// </summary>
        public decimal TotalCost { get; set; }

        /// <summary>
        /// Reference number (invoice number, order number, or document reference).
        /// Max length: 100.
        /// </summary>
        public string? ReferenceNumber { get; set; }

        /// <summary>
        /// Type of reference document (e.g., "Factura", "OrdenCompra", "Despacho", "Reclamo").
        /// Max length: 50.
        /// </summary>
        public string? ReferenceType { get; set; }

        /// <summary>
        /// Additional notes or observations about the movement.
        /// Max length: 500.
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// FK to User — the user who performed this movement.
        /// </summary>
        public long UserId { get; set; }

        /// <summary>
        /// Gets or sets the state of the record (active/inactive). Default: 1 (active).
        /// </summary>
        public int State { get; set; } = 1;

        /// <summary>
        /// Gets or sets the date and time when the record was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the user ID who created the record.
        /// </summary>
        public long CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the user ID who last updated the record.
        /// Nullable for records that have not been updated.
        /// </summary>
        public long? UpdatedBy { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the record was last updated.
        /// Nullable for records that have not been updated.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties

        /// <summary>
        /// Navigation property to the related MedicineInventory entity.
        /// </summary>
        public virtual MedicineInventory? MedicineInventory { get; set; }

        /// <summary>
        /// Navigation property to the related Medicine entity.
        /// </summary>
        public virtual Medicine? Medicine { get; set; }

        /// <summary>
        /// Navigation property to the related Branch entity.
        /// </summary>
        public virtual Branch? Branch { get; set; }

        /// <summary>
        /// Navigation property to the User who performed this movement.
        /// </summary>
        public virtual User? User { get; set; }
    }
}
