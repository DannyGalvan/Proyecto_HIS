import { Form, Input, Label, TextField } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type { MultiValue, SingleValue } from "react-select";
import {
  createLabOrder,
  createLabOrderItem,
  partialUpdateLabOrder,
} from "../../services/labOrderService";
import type { LabExamResponse } from "../../types/LabExamResponse";
import type { LabOrderRequest } from "../../types/LabOrderResponse";
import { formatCurrency } from "../../utils/formatCurrency";
import { AsyncButton } from "../button/AsyncButton";
import {
  LabOrderItemRowComponent,
  type LabOrderItemRow,
} from "../LabOrderForm/LabOrderItemRowComponent";
import { newItemRow } from "../LabOrderForm/NewItemRow";
import { Response } from "../messages/Response";

interface LabOrderFormState {
  consultationId: number | null;
  doctorId: number | null;
  patientId: number | null;
  isExternal: boolean;
  notes: string;
}

interface LabOrderFormProps {
  readonly initialConsultationId?: number | null;
  readonly initialDoctorId?: number | null;
  readonly initialPatientId?: number | null;
  readonly fromDoctorDashboard?: boolean;
  readonly patientName?: string;
  readonly onSuccess?: (labOrderId: number) => void;
}

export function LabOrderForm({
  initialConsultationId,
  initialDoctorId,
  initialPatientId,
  fromDoctorDashboard = false,
  patientName,
  onSuccess,
}: LabOrderFormProps) {
  const [form, setForm] = useState<LabOrderFormState>({
    consultationId: initialConsultationId ?? null,
    doctorId: initialDoctorId ?? null,
    patientId: initialPatientId ?? null,
    isExternal: false,
    notes: "",
  });

  const [items, setItems] = useState<LabOrderItemRow[]>([newItemRow()]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Cache of fetched LabExam data keyed by exam ID
  const examCacheRef = useRef<Map<number, LabExamResponse>>(new Map());

  // ── Computed total ──────────────────────────────────────────────────────────
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.defaultAmount ?? 0), 0),
    [items],
  );

  // ── Field handlers ──────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : type === "number"
              ? value === ""
                ? null
                : Number(value)
              : value,
      }));
    },
    [],
  );

  // ── Item handlers ───────────────────────────────────────────────────────────
  const addItem = useCallback(() => {
    setItems((prev) => [...prev, newItemRow()]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItemExam = useCallback(
    (id: string) =>
      (
        opt:
          | SingleValue<{ label: string; value: string }>
          | MultiValue<{ label: string; value: string }>
          | null,
      ) => {
        if (opt && !Array.isArray(opt) && "value" in opt) {
          const examId = Number(opt.value);
          const cachedExam = examCacheRef.current.get(examId);
          const defaultAmount = cachedExam?.defaultAmount ?? null;
          const examName = cachedExam?.name ?? opt.label;
          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, labExamId: examId, examName, defaultAmount }
                : item,
            ),
          );
        } else {
          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    labExamId: null,
                    examName: "",
                    defaultAmount: null,
                  }
                : item,
            ),
          );
        }
      },
    [],
  );

  const selectorLabExam = useCallback((item: LabExamResponse) => {
    // Cache the full exam data for price lookup
    examCacheRef.current.set(item.id, item);
    return { label: item.name, value: String(item.id) };
  }, []);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const { mutateAsync: doCreateOrder, isPending } = useMutation({
    mutationFn: (data: LabOrderRequest) => createLabOrder(data),
  });

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(null);

      if (!form.doctorId) {
        setSubmitError("El ID del médico es requerido.");
        return;
      }
      if (!form.patientId) {
        setSubmitError("El ID del paciente es requerido.");
        return;
      }
      if (items.length === 0) {
        setSubmitError("Debe agregar al menos un examen.");
        return;
      }
      if (items.some((i) => !i.labExamId)) {
        setSubmitError("Todos los exámenes deben tener un tipo seleccionado.");
        return;
      }

      const orderPayload: LabOrderRequest = {
        consultationId: form.consultationId,
        doctorId: form.doctorId,
        patientId: form.patientId,
        orderStatus: 0,
        isExternal: form.isExternal,
        notes: form.notes || null,
        totalAmount,
        state: 1,
      };

      const orderResponse = await doCreateOrder(orderPayload);
      if (!orderResponse.success) {
        setSubmitError(orderResponse.message ?? "Error al crear la orden.");
        return;
      }

      const labOrderId = orderResponse.data.id;

      // Create each item sequentially and collect real amounts from interceptor
      let realTotal = 0;
      for (const item of items) {
        const itemResponse = await createLabOrderItem({
          labOrderId,
          labExamId: item.labExamId!,
          state: 1,
        });
        if (!itemResponse.success) {
          setSubmitError(`Error al agregar examen: ${itemResponse.message}`);
          return;
        }
        realTotal += itemResponse.data?.amount ?? 0;
      }

      // Patch the order with the real total calculated from catalog prices
      await partialUpdateLabOrder({ id: labOrderId, totalAmount: realTotal });

      const examCount = items.length;
      const totalFormatted = formatCurrency(realTotal);
      setSubmitSuccess(
        `Orden de laboratorio creada exitosamente. ${examCount} examen(es) registrado(s). Costo total: ${totalFormatted}.`,
      );
      onSuccess?.(labOrderId);
    },
    [form, items, doCreateOrder, onSuccess, totalAmount],
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-2">
        Nueva Orden de Laboratorio
      </h1>

      {fromDoctorDashboard && patientName ? (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-center dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <i className="bi bi-flask mr-2" />
            Orden para: <strong>{patientName}</strong>
          </p>
        </div>
      ) : null}

      {submitError ? <Response message={submitError} type={false} /> : null}
      {submitSuccess ? <Response type message={submitSuccess} /> : null}

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* ── Header fields ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Only show manual ID fields when NOT coming from doctor dashboard */}
          {!fromDoctorDashboard && (
            <>
              <TextField className="flex flex-col gap-1" name="consultationId">
                <Label className="font-bold text-sm">
                  ID de Consulta (opcional)
                </Label>
                <Input
                  className="px-3 py-2 border rounded-md"
                  name="consultationId"
                  type="number"
                  value={form.consultationId?.toString() ?? ""}
                  onChange={handleChange}
                />
              </TextField>
              <TextField
                isRequired
                className="flex flex-col gap-1"
                name="doctorId"
              >
                <Label className="font-bold text-sm">ID del Médico *</Label>
                <Input
                  className="px-3 py-2 border rounded-md"
                  name="doctorId"
                  type="number"
                  value={form.doctorId?.toString() ?? ""}
                  onChange={handleChange}
                />
              </TextField>
              <TextField
                isRequired
                className="flex flex-col gap-1"
                name="patientId"
              >
                <Label className="font-bold text-sm">ID del Paciente *</Label>
                <Input
                  className="px-3 py-2 border rounded-md"
                  name="patientId"
                  type="number"
                  value={form.patientId?.toString() ?? ""}
                  onChange={handleChange}
                />
              </TextField>
            </>
          )}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Estado</label>
            <input
              readOnly
              className="px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              type="text"
              value="Pendiente"
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              checked={form.isExternal}
              className="w-4 h-4 accent-blue-600"
              id="isExternal"
              name="isExternal"
              type="checkbox"
              onChange={handleChange}
            />
            <label
              className="font-bold text-sm cursor-pointer"
              htmlFor="isExternal"
            >
              Orden Externa
            </label>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-bold text-sm" htmlFor="notes">
              Notas (opcional)
            </label>
            <textarea
              className="px-3 py-2 border rounded-md resize-none"
              id="notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Items ── */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">
              <i className="bi bi-flask mr-2" />
              Exámenes ({items.length})
            </h2>
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              type="button"
              onClick={addItem}
            >
              <i className="bi bi-plus-circle mr-1" /> Agregar Examen
            </button>
          </div>

          {items.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              No hay exámenes. Haga clic en Agregar Examen para comenzar.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <LabOrderItemRowComponent
                key={item.id}
                index={index}
                item={item}
                selectorLabExam={selectorLabExam}
                onRemove={removeItem}
                onUpdateExam={updateItemExam}
              />
            ))}
          </div>

          {/* ── Total ── */}
          {items.length > 0 && (
            <div className="flex justify-end mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
                Total: {formatCurrency(totalAmount)}
              </span>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <div className="flex justify-end mt-4">
          <AsyncButton
            className="font-bold"
            isLoading={isPending}
            loadingText="Creando orden..."
            size="lg"
            type="submit"
            variant="primary"
          >
            <i className="bi bi-clipboard-plus mr-2" /> Crear Orden
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}
