import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_BRANCH_ID } from "../../configs/constants";
import { getMedicineInventory, getMedicines } from "../../services/medicineService";
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

interface DispenseItemRowComponentProps {
  readonly row: DispenseItemRow;
  readonly idx: number;
  readonly onUpdateRow: (
    idx: number,
    patch: Partial<Omit<DispenseItemRow, "prescriptionItem">> & {
      inventory?: MedicineInventoryResponse | null;
    },
  ) => void;
}

export function DispenseItemRowComponent({
  row,
  idx,
  onUpdateRow,
}: DispenseItemRowComponentProps) {
  const [searchTerm, setSearchTerm] = useState(
    row.inventory?.medicine?.name ?? "",
  );
  const [suggestions, setSuggestions] = useState<MedicineInventoryResponse[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync searchTerm when inventory is pre-populated externally
  useEffect(() => {
    if (row.inventory?.medicine?.name) {
      setSearchTerm(row.inventory.medicine.name);
    }
  }, [row.inventory?.medicine?.name]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      setShowDropdown(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          // 1. Search medicines by name
          const medRes = await getMedicines({
            filters: `Name:like:${value.trim()}`,
            pageSize: 20,
            pageNumber: 1,
            include: "",
            includeTotal: false,
          });
          const medicines = medRes.data ?? [];
          if (medicines.length === 0) {
            setSuggestions([]);
            return;
          }

          // 2. Fetch all inventory for this branch
          const invRes = await getMedicineInventory({
            filters: `BranchId:eq:${DEFAULT_BRANCH_ID}`,
            pageSize: 100,
            pageNumber: 1,
            include: "",
            includeTotal: false,
          });
          const allInv = invRes.data ?? [];

          // 3. Join client-side by medicineId
          const medicineIds = new Set(medicines.map((m) => m.id));
          const matched = allInv
            .filter((inv) => medicineIds.has(inv.medicineId))
            .map((inv) => ({
              ...inv,
              medicine: medicines.find((m) => m.id === inv.medicineId) ?? inv.medicine,
            }));

          setSuggestions(matched);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [],
  );

  const handleSelectInventory = useCallback(
    (inv: MedicineInventoryResponse) => {
      setSearchTerm(inv.medicine?.name ?? "");
      setShowDropdown(false);
      setSuggestions([]);

      const isSubstituted =
        inv.medicine?.name?.toLowerCase() !==
        row.prescriptionItem.medicineName.toLowerCase();

      onUpdateRow(idx, {
        inventory: inv,
        unitPrice: inv.medicine?.defaultPrice ?? 0,
        wasSubstituted: isSubstituted,
        substitutionReason: isSubstituted ? row.substitutionReason : "",
      });
    },
    [idx, onUpdateRow, row.prescriptionItem.medicineName, row.substitutionReason],
  );

  const handleClearSelection = useCallback(() => {
    setSearchTerm("");
    setSuggestions([]);
    onUpdateRow(idx, {
      inventory: null,
      unitPrice: 0,
      wasSubstituted: false,
      substitutionReason: "",
    });
  }, [idx, onUpdateRow]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateRow(idx, { quantity: Math.max(1, Number(e.target.value) || 1) });
    },
    [idx, onUpdateRow],
  );

  const handleUnitPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateRow(idx, { unitPrice: Math.max(0, Number(e.target.value) || 0) });
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

  const stockAvailable = row.inventory?.currentStock ?? null;
  const stockWarning =
    stockAvailable !== null && row.quantity > stockAvailable;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex flex-col gap-3">
      {/* Header: prescribed medicine reference */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-base">{row.prescriptionItem.medicineName}</p>
          {row.prescriptionItem.dosage && (
            <p className="text-xs text-gray-500">Dosis: {row.prescriptionItem.dosage}</p>
          )}
          {row.prescriptionItem.frequency && (
            <p className="text-xs text-gray-500">Frecuencia: {row.prescriptionItem.frequency}</p>
          )}
        </div>
        {row.inventory && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
            ✅ Medicamento seleccionado
          </span>
        )}
      </div>

      {/* Inventory search */}
      <div ref={wrapperRef} className="relative">
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
          Seleccionar del inventario de farmacia
        </label>
        <div className="flex items-center gap-2">
          <input
            className={`flex-1 px-3 py-2 text-sm border rounded-lg ${
              !row.inventory
                ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20"
                : "border-green-400 bg-green-50 dark:bg-green-900/20"
            }`}
            placeholder="🔍 Escriba para buscar en farmacia..."
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
          />
          {row.inventory && (
            <button
              className="text-sm text-gray-400 hover:text-red-500 px-2 py-1 border rounded-lg"
              title="Limpiar selección"
              type="button"
              onClick={handleClearSelection}
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Stock badge */}
        {row.inventory ? (
          <p className={`text-xs mt-1 font-medium ${stockWarning ? "text-red-600" : "text-green-700 dark:text-green-400"}`}>
            {stockWarning
              ? `⚠️ Stock insuficiente — disponible: ${stockAvailable} unidades`
              : `✅ Stock disponible: ${stockAvailable} unidades`}
          </p>
        ) : (
          <p className="text-xs text-orange-500 mt-1">
            ⚠️ Seleccione el medicamento del inventario para continuar
          </p>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 left-0 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-52 overflow-y-auto">
            {isSearching && (
              <p className="px-4 py-3 text-sm text-gray-500">Buscando...</p>
            )}
            {!isSearching && suggestions.length === 0 && searchTerm.length >= 2 && (
              <p className="px-4 py-3 text-sm text-gray-500">
                Sin resultados para "{searchTerm}"
              </p>
            )}
            {!isSearching && searchTerm.length < 2 && (
              <p className="px-4 py-3 text-sm text-gray-400">
                Escriba al menos 2 caracteres para buscar...
              </p>
            )}
            {suggestions.map((inv) => (
              <button
                key={inv.id}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-100 dark:border-gray-700 last:border-0"
                type="button"
                onClick={() => handleSelectInventory(inv)}
              >
                <p className="text-sm font-semibold">{inv.medicine?.name}</p>
                <p className="text-xs text-gray-500">
                  Stock: {inv.currentStock} unidades · Precio: Q {inv.medicine?.defaultPrice?.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity, price, subtotal row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Cantidad
          </label>
          <input
            className={`w-full px-3 py-2 border rounded-lg text-center text-sm ${
              stockWarning ? "border-red-400 bg-red-50" : "border-gray-300 dark:border-gray-600"
            }`}
            min={1}
            type="number"
            value={row.quantity}
            onChange={handleQuantityChange}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Precio Unit.
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <span className="px-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 border-r dark:border-gray-600">Q</span>
            <input
              className={`flex-1 px-2 py-2 text-sm text-center ${
                !row.unitPrice ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-white dark:bg-gray-800"
              }`}
              min={0}
              placeholder="0.00"
              step={0.01}
              type="number"
              value={row.unitPrice || ""}
              onChange={handleUnitPriceChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Subtotal
          </label>
          <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-bold text-center">
            {formatCurrency(row.quantity * row.unitPrice)}
          </p>
        </div>
      </div>

      {/* Substitution */}
      <div className="flex items-start gap-3 pt-1 border-t">
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input
            checked={row.wasSubstituted}
            className="w-4 h-4 accent-blue-600"
            type="checkbox"
            onChange={handleSubstitutedChange}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Sustitución</span>
        </label>
        {row.wasSubstituted && (
          <input
            required
            className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
            placeholder="Razón de sustitución *"
            type="text"
            value={row.substitutionReason}
            onChange={handleSubstitutionReasonChange}
          />
        )}
      </div>
    </div>
  );
}
