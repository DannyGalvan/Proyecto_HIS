import { Form } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createDispense,
  createDispenseItem,
} from "../../services/dispenseService";
import { partialUpdateMedicineInventory } from "../../services/medicineService";
import { getPrescriptionItems } from "../../services/prescriptionService";
import {
  PAYMENT_METHODS,
  type PaymentMethodValue,
} from "../../types/DispenseResponse";
import { formatCurrency } from "../../utils/formatCurrency";
import { AsyncButton } from "../button/AsyncButton";
import {
  DispenseItemRowComponent,
  type DispenseItemRow,
} from "../dispenseForm/DispenseItemRowComponent";
import { Response } from "../messages/Response";
import { LowStockAlert } from "../shared/LowStockAlert";

export interface DispenseFormProps {
  readonly prescriptionId: number;
  readonly onSuccess?: (dispenseId: number) => void;
}

export function DispenseForm({ prescriptionId, onSuccess }: DispenseFormProps) {
  const [rows, setRows] = useState<DispenseItemRow[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | "">("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // ── Fetch prescription items ─────────────────────────────────────────────
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["prescriptionItems", prescriptionId],
    queryFn: () =>
      getPrescriptionItems({
        filters: `PrescriptionId:eq:${prescriptionId}`,
        pageSize: 100,
        pageNumber: 1,
        include: "",
        includeTotal: false,
      }),
    enabled: !!prescriptionId,
  });

  const prescriptionItems = useMemo(() => itemsData?.data ?? [], [itemsData]);

  // ── Build rows once prescription items are available (inventory selected by pharmacist) ──
  useEffect(() => {
    if (prescriptionItems.length === 0) return;
    setRows(
      prescriptionItems.map((item) => ({
        prescriptionItem: item,
        inventory: null,
        quantity: 1,
        unitPrice: 0,
        wasSubstituted: false,
        substitutionReason: "",
      })),
    );
  }, [prescriptionItems]);

  // ── Row field handlers ───────────────────────────────────────────────────
  const updateRow = useCallback(
    (
      idx: number,
      patch: Partial<Omit<DispenseItemRow, "prescriptionItem">>,
    ) => {
      setRows((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  // ── Computed total ───────────────────────────────────────────────────────
  const total = useMemo(
    () => rows.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0),
    [rows],
  );

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

      // Validate payment method selection [RN-GLOBAL-004]
      if (!paymentMethod) {
        setSubmitError(
          "Debe seleccionar un método de pago antes de confirmar el despacho.",
        );
        return;
      }

      // Validate substitution reasons
      for (const row of rows) {
        if (row.wasSubstituted && !row.substitutionReason.trim()) {
          setSubmitError(
            `La razón de sustitución es requerida para "${row.prescriptionItem.medicineName}".`,
          );
          return;
        }
      }

      // Validate stock sufficiency
      for (const row of rows) {
        if (row.inventory && row.quantity > row.inventory.currentStock) {
          setSubmitError(
            `Stock insuficiente para "${row.prescriptionItem.medicineName}". Stock actual: ${row.inventory.currentStock}. Cantidad solicitada: ${row.quantity}.`,
          );
          return;
        }
      }

      // 1. Create dispense header — PharmacistId, PatientId and DispenseStatus resolved server-side
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
          substitutionReason: row.wasSubstituted
            ? row.substitutionReason
            : null,
          originalMedicineName: medicineName,
          dispensedMedicineName: row.wasSubstituted
            ? row.substitutionReason.split(":")[0]?.trim() || medicineName
            : medicineName,
          state: 1,
        });

        if (!itemRes.success) {
          setSubmitError(
            `Error al registrar ítem "${medicineName}": ${itemRes.message}`,
          );
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

      const totalFormatted = formatCurrency(Math.round(total * 100) / 100);
      const itemCount = rows.length;
      const methodLabel =
        PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ??
        paymentMethod;
      setSubmitSuccess(
        `Despacho registrado exitosamente. ${itemCount} medicamento(s) despachado(s). Total: ${totalFormatted}. Pago: ${methodLabel}.`,
      );
      onSuccess?.(dispenseId);
    },
    [rows, total, prescriptionId, paymentMethod, doCreateDispense, onSuccess],
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
      <h1 className="text-2xl font-bold text-center mb-6">
        Despachar Receta #{prescriptionId}
      </h1>

      {submitError ? <Response message={submitError} type={false} /> : null}
      {submitSuccess ? <Response type message={submitSuccess} /> : null}

      {/* Low-stock alerts */}
      <div className="flex flex-col gap-2 mb-4">
        {rows.map((row) =>
          row.inventory &&
          row.inventory.currentStock <=
            (row.inventory.medicine?.minimumStock ?? 0) ? (
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
        {/* Items — card layout (avoids table overflow clipping dropdowns) */}
        <div className="flex flex-col gap-3">
          {rows.map((row, idx) => (
            <DispenseItemRowComponent
              key={row.prescriptionItem.id}
              idx={idx}
              row={row}
              onUpdateRow={updateRow}
            />
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-end items-center gap-4 mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <span className="text-lg font-bold">Total del Despacho:</span>
          <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Payment method selector [RN-GLOBAL-004] */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border mt-2">
          <h3 className="text-md font-bold mb-3">
            <i className="bi bi-credit-card mr-2" />
            Método de Pago
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === method.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                }`}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
              >
                <i
                  className={`bi ${
                    method.value === "EFECTIVO"
                      ? "bi-cash-coin"
                      : method.value === "TARJETA_CREDITO"
                        ? "bi-credit-card-2-front"
                        : "bi-credit-card"
                  } text-xl ${
                    paymentMethod === method.value
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    paymentMethod === method.value
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {method.label}
                </span>
              </button>
            ))}
          </div>
          {!paymentMethod && submitError?.includes("método de pago") ? (
            <p className="text-danger text-sm mt-2">
              <i className="bi bi-exclamation-circle mr-1" />
              Seleccione un método de pago
            </p>
          ) : null}
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
