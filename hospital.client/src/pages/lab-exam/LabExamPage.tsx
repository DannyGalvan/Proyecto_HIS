import { useCallback } from "react";
import { LabExamResponseColumns } from "../../components/column/LabExamResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getLabExams } from "../../services/labExamService";
import { useLabExamStore } from "../../stores/useLabExamStore";
import { customStyles } from "../../theme/tableTheme";

export function LabExamPage() {
  const { filters, setFilters } = useLabExamStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getLabExams({ pageNumber: page, pageSize, filters, include: "Laboratory", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Exámenes de Laboratorio</h1>
      <TableServer
        hasFilters
        columns={LabExamResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="lab-exams"
        setFilters={setFilters}
        styles={customStyles}
        text="exámenes"
        title="Exámenes de Laboratorio"
      />
    </div>
  );
}
