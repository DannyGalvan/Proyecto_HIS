import { useCallback } from "react";
import type { MedicineInventoryResponse } from "../../types/MedicineInventoryResponse";
import type { PrescriptionItemResponse } from "../../types/PrescriptionItemResponse";
import { formatCurrency } from "../../utils/formatCurrency";

export interface DispenseItemRow {
  prescriptionItem: PrescriptionItemResponse;
  inventory: MedicineInventoryResponse | null;
  quantity: number;
  unitPrice: number;
  wasSubstituted: boolean;
  substitutionReason: string;
}

// ── Extracted row component for dispense items ─────────────────────────────

interface DispenseItemRowComponentProps {
  readonly row: DispenseItemRow;
  readonly idx: number;
  readonly onUpdateRow: (
    idx: number,
    patch: Partial<Omit<DispenseItemRow, "prescriptionItem" | "inventory">>,
  ) => void;
}

export function DispenseItemRowComponent({
  row,
  idx,
  onUpdateRow,
}: DispenseItemRowComponentProps) {
  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateRow(idx, {
        quantity: Math.max(1, Number(e.target.value) || 1),
      });
    },
    [idx, onUpdateRow],
  );

  const handleSubstitutedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateRow(idx, {
        wasSubstituted: e.target.checked,
        substitutionReason: e.target.checked ? row.substitutionReason : "",
      });
    },
    [idx, onUpdateRow, row.substitutionReason],
  );

  const handleSubstitutionReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateRow(idx, { substitutionReason: e.target.value });
    },
    [idx, onUpdateRow],
  );

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      {/* Medicine name */}
      <td className="px-4 py-3 font-medium">
        {row.prescriptionItem.medicineName}
        {row.prescriptionItem.dosage ? (
          <span className="block text-xs text-gray-500">
            Dosis: {row.prescriptionItem.dosage}
          </span>
        ) : null}
        {row.inventory === null && (
          <span className="block text-xs text-orange-500">
            ⚠️ Sin inventario registrado
          </span>
        )}
      </td>

      {/* Quantity */}
      <td className="px-4 py-3">
        <input
          className="w-full px-2 py-1 border rounded-md text-center"
          min={1}
          type="number"
          value={row.quantity}
          onChange={handleQuantityChange}
        />
      </td>

      {/* Unit price */}
      <td className="px-4 py-3 text-center">
        {!row.unitPrice ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800">
            <i className="bi bi-exclamation-triangle" /> Precio no configurado
          </span>
        ) : (
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            {formatCurrency(row.unitPrice)}
          </span>
        )}
      </td>

      {/* Subtotal */}
      <td className="px-4 py-3 text-center font-semibold">
        {formatCurrency(row.quantity * row.unitPrice)}
      </td>

      {/* Was substituted checkbox */}
      <td className="px-4 py-3 text-center">
        <input
          checked={row.wasSubstituted}
          className="w-4 h-4 accent-blue-600"
          id={`sub-${idx}`}
          type="checkbox"
          onChange={handleSubstitutedChange}
        />
      </td>

      {/* Substitution reason */}
      <td className="px-4 py-3">
        {row.wasSubstituted ? (
          <input
            required
            className="w-full px-2 py-1 border rounded-md"
            placeholder="Razón de sustitución *"
            type="text"
            value={row.substitutionReason}
            onChange={handleSubstitutionReasonChange}
          />
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}
