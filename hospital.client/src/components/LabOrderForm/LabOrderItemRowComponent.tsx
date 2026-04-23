import { useCallback, useMemo } from "react";
import type { MultiValue, SingleValue } from "react-select";
import { getLabExams } from "../../services/labExamService";
import type { LabExamResponse } from "../../types/LabExamResponse";
import { formatCurrency } from "../../utils/formatCurrency";
import { CatalogueSelect } from "../select/CatalogueSelect";

export interface LabOrderItemRow {
  id: string; // local key for React list rendering
  labExamId: number | null;
  examName: string;
  defaultAmount: number | null;
}

// ── Extracted item row component ──────────────────────────────────────────────

interface LabOrderItemRowProps {
  readonly item: LabOrderItemRow;
  readonly index: number;
  readonly onRemove: (id: string) => void;
  readonly onUpdateExam: (
    id: string,
  ) => (
    opt:
      | SingleValue<{ label: string; value: string }>
      | MultiValue<{ label: string; value: string }>
      | null,
  ) => void;
  readonly selectorLabExam: (item: LabExamResponse) => {
    label: string;
    value: string;
  };
}

export function LabOrderItemRowComponent({
  item,
  index,
  onRemove,
  onUpdateExam,
  selectorLabExam,
}: LabOrderItemRowProps) {
  const handleRemove = useCallback(
    () => onRemove(item.id),
    [item.id, onRemove],
  );

  const handleExamChange = useMemo(
    () => onUpdateExam(item.id),
    [item.id, onUpdateExam],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-3 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div>
        <label className="font-bold text-sm block mb-1">
          Examen #{index + 1} *
        </label>
        <CatalogueSelect<LabExamResponse>
          fieldSearch="Name"
          label=""
          placeholder="Buscar examen..."
          queryFn={getLabExams}
          selectorFn={selectorLabExam}
          onChange={handleExamChange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-bold text-sm">Precio</label>
        {item.labExamId == null ? (
          <span className="px-3 py-2 text-sm text-gray-400">—</span>
        ) : !item.defaultAmount ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800">
            <i className="bi bi-exclamation-triangle" /> Precio no configurado
          </span>
        ) : (
          <span className="px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
            {formatCurrency(item.defaultAmount)}
          </span>
        )}
      </div>

      <button
        className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors self-end"
        type="button"
        onClick={handleRemove}
      >
        <i className="bi bi-trash mr-1" /> Eliminar
      </button>
    </div>
  );
}
