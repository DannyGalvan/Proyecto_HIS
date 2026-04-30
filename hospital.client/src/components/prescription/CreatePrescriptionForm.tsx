import { toast } from "@heroui/react";
import { useCallback, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createPrescriptionWithItems } from "../../services/prescriptionService";
import type { PrescriptionItemInlineRequest } from "../../types/PrescriptionResponse";
import { AsyncButton } from "../button/AsyncButton";
import { PrescriptionItemForm, type ItemRow } from "./PrescriptionItemForm";

const newRow = (): ItemRow => ({
  key: crypto.randomUUID(),
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  specialInstructions: "",
});

interface CreatePrescriptionFormProps {
  readonly consultationId: number;
  readonly doctorId: number;
  readonly patientName?: string;
  readonly onCreated: (id: number) => void;
}

export function CreatePrescriptionForm({
  consultationId,
  doctorId,
  patientName,
  onCreated,
}: CreatePrescriptionFormProps) {
  const { userId } = useAuth();
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([newRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRow = useCallback(() => setItems((prev) => [...prev, newRow()]), []);

  const removeRow = useCallback(
    (key: string) => setItems((prev) => prev.filter((r) => r.key !== key)),
    [],
  );

  const updateRow = useCallback(
    (key: string, field: keyof Omit<ItemRow, "key">, value: string) =>
      setItems((prev) =>
        prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
      ),
    [],
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value),
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (
        items.some(
          (r) => !r.medicineName || !r.dosage || !r.frequency || !r.duration,
        )
      ) {
        setError(
          "Todos los medicamentos deben tener nombre, dosis, frecuencia y duracion.",
        );
        return;
      }
      setSubmitting(true);
      try {
        const payload = {
          consultationId,
          doctorId,
          prescriptionDate: new Date().toISOString(),
          notes: notes || null,
          state: 1,
          createdBy: userId,
          items: items.map(
            (r): PrescriptionItemInlineRequest => ({
              medicineName: r.medicineName,
              dosage: r.dosage,
              frequency: r.frequency,
              duration: r.duration,
              specialInstructions: r.specialInstructions || null,
            }),
          ),
        };
        const response = await createPrescriptionWithItems(payload);
        if (response.success && response.data) {
          toast.success(
            "Receta creada correctamente con todos sus medicamentos.",
          );
          onCreated(response.data.id);
        } else {
          setError(response.message ?? "Error al crear la receta.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [items, consultationId, doctorId, notes, userId, onCreated],
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Nueva Receta Medica</h1>
      {patientName ? (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <i className="bi bi-person-check mr-2" />
            Receta para: <strong>{patientName}</strong>
          </p>
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-300 p-3 text-sm text-red-800">
          <i className="bi bi-exclamation-triangle mr-2" />
          {error}
        </div>
      ) : null}
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h2 className="font-bold mb-3">Indicaciones Generales</h2>
          <textarea
            className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Indicaciones generales de la receta (opcional)..."
            rows={2}
            value={notes}
            onChange={handleNotesChange}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">
              <i className="bi bi-capsule mr-2" />
              Medicamentos ({items.length})
            </h2>
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              type="button"
              onClick={addRow}
            >
              <i className="bi bi-plus-circle mr-1" /> Agregar
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {items.map((row, idx) => (
              <PrescriptionItemForm
                key={row.key}
                canRemove={items.length > 1}
                index={idx}
                row={row}
                onRemove={removeRow}
                onUpdate={updateRow}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <AsyncButton
            isLoading={submitting}
            loadingText="Guardando receta..."
            size="lg"
            type="submit"
            variant="primary"
          >
            <i className="bi bi-prescription2 mr-2" /> Guardar Receta Completa
          </AsyncButton>
        </div>
      </form>
    </div>
  );
}
