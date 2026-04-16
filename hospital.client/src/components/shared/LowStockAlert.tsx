interface LowStockAlertProps {
  /** Name of the medicine with low stock */
  readonly medicineName: string;
  /** Current stock level */
  readonly currentStock: number;
  /** Minimum stock threshold */
  readonly minimumStock: number;
}

/**
 * Renders an orange warning alert when a medicine's stock is at or below
 * the minimum threshold. Returns null when stock is sufficient.
 */
export function LowStockAlert({ medicineName, currentStock, minimumStock }: LowStockAlertProps) {
  if (currentStock > minimumStock) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm">
      <span aria-hidden="true" className="text-orange-500">⚠️</span>
      <span className="font-semibold text-orange-800">{medicineName}:</span>
      <span className="text-orange-700">
        Stock bajo — disponible: <strong>{currentStock}</strong> (mínimo: {minimumStock})
      </span>
    </div>
  );
}
