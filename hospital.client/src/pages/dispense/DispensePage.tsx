import { Button } from "@heroui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { DispenseResponseColumns } from "../../components/column/DispenseResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { nameRoutes } from "../../configs/constants";
import { getDispenses } from "../../services/dispenseService";
import { useDispenseStore } from "../../stores/useDispenseStore";
import { customStyles } from "../../theme/tableTheme";

export function DispensePage() {
  const { filters, setFilters } = useDispenseStore();
  const navigate = useNavigate();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getDispenses({
        pageNumber: page,
        pageSize,
        filters,
        include: "Prescription",
        includeTotal: false,
      });
    },
    [],
  );

  const handleNewDispense = useCallback(
    () => navigate(nameRoutes.dispenseSelect),
    [navigate],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Despachos</h1>
        <Button
          className="font-semibold"
          size="md"
          variant="primary"
          onPress={handleNewDispense}
        >
          <i className="bi bi-bag-plus mr-2" />
          Nuevo Despacho
        </Button>
      </div>
      <TableServer
        hasFilters
        columns={DispenseResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="dispenses"
        setFilters={setFilters}
        styles={customStyles}
        text="despachos"
        title="Despachos"
      />
    </div>
  );
}
