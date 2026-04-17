import { useCallback } from "react";
import { Link } from "react-router";
import { InventoryMovementResponseColumns } from "../../components/column/InventoryMovementResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { nameRoutes } from "../../configs/constants";
import { getInventoryMovements } from "../../services/inventoryMovementService";
import { useInventoryMovementStore } from "../../stores/useInventoryMovementStore";
import { customStyles } from "../../theme/tableTheme";

export function InventoryMovementPage() {
  const { filters, setFilters } = useInventoryMovementStore();

  const queryFn = useCallback(
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
      <h1 className="text-2xl font-bold text-center mb-4">
        Bitácora de Movimientos de Inventario
      </h1>
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
        📋 Registro de todas las entradas y salidas de medicamentos. Use los filtros para buscar por medicamento, sucursal, tipo de movimiento o usuario.
      </div>
      <div className="flex justify-end mb-4">
        <Link
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-600 transition-colors"
          to={nameRoutes.inventoryMovementCreate}
        >
          <i className="bi bi-plus-lg" />
          Nuevo Movimiento
        </Link>
      </div>
      <TableServer
        hasFilters
        hasRangeOfDates
        columns={InventoryMovementResponseColumns}
        fieldRangeOfDates="CreatedAt"
        filters={filters}
        queryFn={queryFn}
        queryKey="inventory-movements"
        setFilters={setFilters}
        styles={customStyles}
        text="movimientos"
        title="Bitácora de Movimientos"
      />
    </div>
  );
}
