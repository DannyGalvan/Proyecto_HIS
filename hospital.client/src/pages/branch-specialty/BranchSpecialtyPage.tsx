import { useCallback } from "react";
import { useNavigate } from "react-router";
import { BranchSpecialtyResponseColumns } from "../../components/column/BranchSpecialtyResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getBranchSpecialties } from "../../services/branchSpecialtyService";
import { useBranchSpecialtyStore } from "../../stores/useBranchSpecialtyStore";
import { customStyles } from "../../theme/tableTheme";
import { nameRoutes } from "../../configs/constants";

export function BranchSpecialtyPage() {
  const { filters, setFilters } = useBranchSpecialtyStore();
  const navigate = useNavigate();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getBranchSpecialties({
        pageNumber: page,
        pageSize,
        filters,
        include: "Branch,Specialty",
        includeTotal: false,
      });
    },
    [],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Especialidades por Sede</h1>
        <button
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          type="button"
          onClick={() => navigate(nameRoutes.branchSpecialtyCreate)}
        >
          <i className="bi bi-plus-circle" />
          Asignar Especialidad
        </button>
      </div>
      <TableServer
        hasFilters
        columns={BranchSpecialtyResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="branch-specialties"
        setFilters={setFilters}
        styles={customStyles}
        text="asignaciones"
        title="Especialidades por Sede"
      />
    </div>
  );
}
