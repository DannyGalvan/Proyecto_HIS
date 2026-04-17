import { useCallback } from "react";
import { MedicineInventoryResponseColumns } from "../../components/column/MedicineInventoryResponseColumns";
import { InventoryMovementResponseColumns } from "../../components/column/InventoryMovementResponseColumns";
import { MedicineInventorySummary } from "../../components/shared/MedicineInventorySummary";
import { TableServer } from "../../components/table/TableServer";
import { getMedicineInventory } from "../../services/medicineService";
import { getInventoryMovements } from "../../services/inventoryMovementService";
import { useMedicineInventoryStore } from "../../stores/useMedicineInventoryStore";
import { useInventoryMovementStore } from "../../stores/useInventoryMovementStore";
import { customStyles } from "../../theme/tableTheme";

export function MedicineInventoryPage() {
  const { filters, setFilters } = useMedicineInventoryStore();
  const { filters: movementFilters, setFilters: setMovementFilters } = useInventoryMovementStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getMedicineInventory({
        pageNumber: page,
        pageSize,
        filters,
        include: "Medicine,Branch",
        includeTotal: false,
      });
    },
    [],
  );

  const movementQueryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getInventoryMovements({
        pageNumber: page,
        pageSize,
        filters,
        include: "Medicine,Branch,User",
        includeTotal: false,
      });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Inventario de Farmacia</h1>
      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
        ⚠️ Los registros marcados en <strong className="text-red-600">rojo</strong> han alcanzado o están por debajo del stock mínimo y requieren reorden.
      </div>
      <TableServer
        hasFilters
        columns={MedicineInventoryResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="medicine-inventory"
        setFilters={setFilters}
        styles={customStyles}
        text="registros"
        title="Inventario de Farmacia"
        expandableRowsComponent={MedicineInventorySummary}
      />

      {/* Bitácora de Movimientos */}
      <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-center mb-4">Bitácora de Movimientos</h2>
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
          📋 Registro de todas las entradas y salidas de medicamentos. Use los filtros para buscar por medicamento, sucursal, tipo de movimiento o usuario.
        </div>
        <TableServer
          hasFilters
          hasRangeOfDates
          fieldRangeOfDates="CreatedAt"
          columns={InventoryMovementResponseColumns}
          filters={movementFilters}
          queryFn={movementQueryFn}
          queryKey="inventory-movements"
          setFilters={setMovementFilters}
          styles={customStyles}
          text="movimientos"
          title="Bitácora de Movimientos"
        />
      </div>
    </div>
  );
}
