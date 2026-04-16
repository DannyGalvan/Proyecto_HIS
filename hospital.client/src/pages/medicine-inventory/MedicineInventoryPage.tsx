import { useCallback } from "react";
import { MedicineInventoryResponseColumns } from "../../components/column/MedicineInventoryResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getMedicineInventory } from "../../services/medicineService";
import { useMedicineInventoryStore } from "../../stores/useMedicineInventoryStore";
import { customStyles } from "../../theme/tableTheme";

export function MedicineInventoryPage() {
  const { filters, setFilters } = useMedicineInventoryStore();

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
      />
    </div>
  );
}
