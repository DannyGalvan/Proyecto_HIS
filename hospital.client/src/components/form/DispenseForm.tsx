import { Form } from "@heroui/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { AsyncButton } from "../button/AsyncButton";
import { Response } from "../messages/Response";
import { LowStockAlert } from "../shared/LowStockAlert";
import { getPrescriptionItems } from "../../services/prescriptionService";
import { getMedicineInventory, partialUpdateMedicineInventory } from "../../services/medicineService";
import { createDispense, createDispenseItem } from "../../services/dispenseService";
import type { PrescriptionItemResponse } from "../../types/PrescriptionItemResponse";
import type { MedicineInventoryResponse } from "../../types/MedicineInventoryResponse";

export interface DispenseFormProps {
  readonly prescriptionId: number;
  readonly prescriptionDate: string;
  readonly onSuccess?: (dispenseId: number) => void;
}

interface DispenseItemRow {
  prescriptionItem: PrescriptionItemResponse;
  inventory: MedicineInventoryResponse | null;
  quantity: number;
  unitPrice: number;
  wasSubstituted: boolean;
  substitutionReason: string;
}

const DEFAULT_BRANCH_ID = 1;

export function DispenseForm({ prescriptionId, onSuccess }: DispenseFormProps) {
  const [rows, setRows] = useState<DispenseItemRow[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // ── Fetch prescription items ─────────────────────────────────────────────
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["prescriptionItems", prescriptionId],
    queryFn: () =>
      getPrescriptionItems({
        filters: `PrescriptionId:eq:${prescriptionId}`,
        pageSize: 100,
      }),
    enabled: !!prescriptionId,
  });

  // ── Fetch inventory for each medicine name ───────────────────────────────
  const prescriptionItems = itemsData?.data ?? [];

  const { data: inventoryData } = useQuery({
    queryKey: ["dispenseInventory", prescriptionId],
    queryFn: async () => {
      if (prescriptionItems.length === 0) return [];
      const results: MedicineInventoryResponse[] = [];
      for (const item of prescriptionItems) {
        const res = await getMedicineInventory({
          filters: `Medicine.Name:like:${item.medicineName},BranchId:eq:${DEFAULT_BRANCH_ID}`,
          include: "Medicine",
          pageSize: 1,
        });
        if (res.data && res.data.length > 0) {
          results.push(res.data[0]);
        } else {
          // Push a sentinel so index alignment is preserved
          results.push(null as unknown as MedicineInventoryResponse);
        }
      }
      return results;
    },
    enabled: prescriptionItems.length > 0,
  });

  // ── Build rows once both datasets are available ──────────────────────────
  useEffect(() => {
    if (prescriptionItems.length === 0) return;
    const inv = inventoryData ?? [];
    setRows(
      prescriptionItems.map((item, idx) => {
        const inventory = inv[idx] ?? null;
        return {
          prescriptionItem: item,
          inventory,
          quantity: 1,
          unitPrice: inventory?.medicine?.defaultPrice ?? 0,
          wasSubstituted: false,
          substitutionReason: "",
        };
      }),
    );
  }, [prescriptionItems, inventoryData]);

  // ── Row field handlers ───────────────────────────────────────────────────
  const updateRow = useCallback(
    (idx: number, patch: Partial<Omit<DispenseItemRow, "prescriptionItem" | "inventory">>) => {
      setRows((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  // ── Computed total ───────────────────────────────────────────────────────
  const total = rows.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);

  // ── Mutations ────────────────────────────────────────────────────────────
  const { mutateAsync: doCreateDispense, isPending } = useMutation({
    mutationFn: createDispense,
  });

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(null);

      // Validate substitution reasons
      for (const row of rows) {
        if (row.wasSubstituted && !row.substitutionReason.trim()) {
          setSubmitError(
            `La razón de sustitución es requerida para "${row.prescriptionItem.medicineName}".`,
          );
          return;
        }
      }

      // 1. Create dispense header
      const dispenseRes = await doCreateDispense({
        prescriptionId,
        totalAmount: Math.round(total * 100) / 100,
        state: 1,
      });

      if (!dispenseRes.success) {
        setSubmitError(dispenseRes.message ?? "Error al crear el despacho.");
        return;
      }

      const dispenseId = dispenseRes.data.id;

      // 2. Create each dispense item + update inventory
      for (const row of rows) {
        const medicineName = row.prescriptionItem.medicineName;

        const itemRes = await createDispenseItem({
          dispenseId,
          medicineId: row.inventory?.medicineId ?? null,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          wasSubstituted: row.wasSubstituted,
          substitutionReason: row.wasSubstituted ? row.substitutionReason : null,
          originalMedicineName: medicineName,
          dispensedMedicineName: row.wasSubstituted
            ? row.substitutionReason.split(":")[0]?.trim() || medicineName
            : medicineName,
          state: 1,
        });

        if (!itemRes.success) {
          setSubmitError(`Error al registrar ítem "${medicineName}": ${itemRes.message}`);
          return;
        }

        // 3. Update inventory stock
        if (row.inventory) {
          const newStock = row.inventory.currentStock - row.quantity;
          await partialUpdateMedicineInventory({
            id: row.inventory.id,
            currentStock: newStock,
          });
        }
      }

      setSubmitSuccess("Despacho registrado exitosamente.");
      onSuccess?.(dispenseId);
    },
    [rows, total, prescriptionId, doCreateDispense, onSuccess],
  );

  if (itemsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500">Cargando ítems de la receta...</span>
      </div>
    );
  }

  if (prescriptionItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-center text-gray-500">
          Esta receta no tiene ítems registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Despachar Receta #{prescriptionId}</h1>

      {submitError && <Response message={submitError} type={false} />}
      {submitSuccess && <Response message={submitSuccess} type={true} />}

      {/* Low-stock alerts */}
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row) =>
          row.inventory &&
          row.inventory.currentStock <= (row.inventory.medicine?.minimumStock ?? 0) ? (
            <LowStockAlert
              key={row.prescriptionItem.id}
              currentStock={row.inventory.currentStock}
              medicineName={row.prescriptionItem.medicineName}
              minimumStock={row.inventory.medicine?.minimumStock ?? 0}
            />
          ) : null,
        )}
      </div>

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Items table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Medicamento</th>
                <th className="px-4 py-3 text-center font-semibold w-28">Cantidad</th>
                <th className="px-4 py-3 text-center font-semibold w-32">Precio Unit.</th>
                <th className="px-4 py-3 text-center font-semibold w-28">Subtotal</th>
                <th className="px-4 py-3 text-center font-semibold w-28">Sustitución</th>
                <th className="px-4 py-3 text-left font-semibold">Razón de Sustitución</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, idx) => (
                <tr key={row.prescriptionItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {/* Medicine name */}
                  <td className="px-4 py-3 font-medium">
                    {row.prescriptionItem.medicineName}
                    {row.prescriptionItem.dosage && (
                      <span className="block text-xs text-gray-500">
                        Dosis: {row.prescriptionItem.dosage}
                      </span>
                    )}
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
                      onChange={(e) =>
                        updateRow(idx, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </td>

                  {/* Unit price */}
                  <td className="px-4 py-3">
                    <input
                      className="w-full px-2 py-1 border rounded-md text-center"
                      min={0}
                      step={0.01}
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) =>
                        updateRow(idx, {
                          unitPrice: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </td>

                  {/* Subtotal */}
                  <td className="px-4 py-3 text-center font-semibold">
                    Q{(row.quantity * row.unitPrice).toFixed(2)}
                  </td>

                  {/* Was substituted checkbox */}
                  <td className="px-4 py-3 text-center">
                    <input
                      checked={row.wasSubstituted}
                      className="w-4 h-4 accent-blue-600"
                      id={`sub-${idx}`}
                      type="checkbox"
                      onChange={(e) =>
                        updateRow(idx, {
                          wasSubstituted: e.target.checked,
                          substitutionReason: e.target.checked ? row.substitutionReason : "",
                        })
                      }
                    />
                  </td>

                  {/* Substitution reason */}
                  <td className="px-4 py-3">
                    {row.wasSubstituted ? (
                      <input
                        className="w-full px-2 py-1 border rounded-md"
                        placeholder="Razón de sustitución *"
                        required
                        type="text"
                        value={row.substitutionReason}
                        onChange={(e) =>
                          updateRow(idx, { substitutionReason: e.target.value })
                        }
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end items-center gap-4 mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <span className="text-lg font-bold">Total del Despacho:</span>
          <span className="text-2xl font-bold text-green-700">
            Q{total.toFixed(2)}
          </span>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-2">
          <AsyncButton
            className="font-bold"
            isLoading={isPending}
            loadingText="Procesando despacho..."
            size="lg"
            type="submit"
            variant="primary"
          >
            <i className="bi bi-bag-check mr-2" /> Confirmar Despacho
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}
