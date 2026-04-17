import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getInventoryMovements } from "../../services/inventoryMovementService";
import type { InventoryMovementResponse } from "../../types/InventoryMovementResponse";
import { MovementTypeLabels } from "../../types/InventoryMovementResponse";
import type { MedicineInventoryResponse } from "../../types/MedicineInventoryResponse";

interface MedicineInventorySummaryProps {
  readonly data: MedicineInventoryResponse;
}

/** Entry movement types: Compra(0), Devolución(1), Ajuste+(4) */
const ENTRY_TYPES = new Set([0, 1, 4]);
/** Exit movement types: Venta(2), Reclamo(3), Ajuste-(5), Despacho(6) */
const EXIT_TYPES = new Set([2, 3, 5, 6]);

function getMonthDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function MedicineInventorySummary({ data }: MedicineInventorySummaryProps) {
  const { start, end } = useMemo(() => getMonthDateRange(), []);

  const { data: movementsResponse, isPending } = useQuery({
    queryKey: ["inventory-summary", data.id, start, end],
    queryFn: () =>
      getInventoryMovements({
        pageNumber: 1,
        pageSize: 100,
        filters: `MedicineInventoryId:eq:${data.id} AND CreatedAt:gte:${start} AND CreatedAt:lte:${end}`,
        include: "User",
        includeTotal: false,
      }),
  });

  const { data: lastMovementResponse, isPending: isLastPending } = useQuery({
    queryKey: ["inventory-last-movement", data.id],
    queryFn: () =>
      getInventoryMovements({
        pageNumber: 1,
        pageSize: 1,
        filters: `MedicineInventoryId:eq:${data.id}`,
        include: "User",
        includeTotal: false,
      }),
  });

  const summary = useMemo(() => {
    const movements: InventoryMovementResponse[] =
      movementsResponse?.success ? movementsResponse.data : [];

    let totalEntries = 0;
    let totalExits = 0;

    for (const m of movements) {
      if (ENTRY_TYPES.has(m.movementType)) {
        totalEntries += m.quantity;
      } else if (EXIT_TYPES.has(m.movementType)) {
        totalExits += m.quantity;
      }
    }

    return { totalEntries, totalExits, movementCount: movements.length };
  }, [movementsResponse]);

  const lastMovement: InventoryMovementResponse | null = useMemo(() => {
    if (lastMovementResponse?.success && lastMovementResponse.data.length > 0) {
      return lastMovementResponse.data[0];
    }
    return null;
  }, [lastMovementResponse]);

  if (isPending || isLastPending) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="animate-spin">⏳</span> Cargando resumen...
        </div>
      </div>
    );
  }

  const medicineName = data.medicine?.name ?? "Medicamento";
  const currentStock = data.currentStock;
  const minimumStock = data.medicine?.minimumStock ?? 0;
  const isLowStock = currentStock <= minimumStock;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-blue-400">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        📊 Resumen mensual — {medicineName}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Stock Actual */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Stock Actual</p>
          <p className={`text-lg font-bold ${isLowStock ? "text-red-600" : "text-green-600"}`}>
            {currentStock} {isLowStock && "⚠️"}
          </p>
        </div>

        {/* Stock Mínimo */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Stock Mínimo</p>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{minimumStock}</p>
        </div>

        {/* Total Entradas del Mes */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Entradas del Mes</p>
          <p className="text-lg font-bold text-green-600">
            +{summary.totalEntries}
          </p>
        </div>

        {/* Total Salidas del Mes */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Salidas del Mes</p>
          <p className="text-lg font-bold text-red-600">
            -{summary.totalExits}
          </p>
        </div>

        {/* Último Movimiento */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Último Movimiento</p>
          {lastMovement ? (
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  MovementTypeLabels[lastMovement.movementType]?.color ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {MovementTypeLabels[lastMovement.movementType]?.label ?? "Desconocido"}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(lastMovement.createdAt)} — {lastMovement.quantity} uds.
              </p>
              {lastMovement.user?.name && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  por {lastMovement.user.name}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin movimientos</p>
          )}
        </div>
      </div>
    </div>
  );
}
