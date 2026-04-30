import { useCallback, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createPrescriptionItem } from "../../services/prescriptionService";
import { AsyncButton } from "../button/AsyncButton";

interface AddItemFormProps {
  readonly prescriptionId: number;
  readonly onSuccess: () => void;
}

export function AddItemForm({ prescriptionId, onSuccess }: AddItemFormProps) {
  const { userId } = useAuth();
  const [item, setItem] = useState({
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "",
    specialInstructions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    (field: string, value: string) =>
      setItem((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleMedicineName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update("medicineName", e.target.value),
    [update],
  );
  const handleDosage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update("dosage", e.target.value),
    [update],
  );
  const handleFrequency = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update("frequency", e.target.value),
    [update],
  );
  const handleDuration = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update("duration", e.target.value),
    [update],
  );
  const handleSpecialInstructions = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update("specialInstructions", e.target.value),
    [update],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (
        !item.medicineName ||
        !item.dosage ||
        !item.frequency ||
        !item.duration
      ) {
        setError("Todos los campos obligatorios deben estar completos.");
        return;
      }
      setSubmitting(true);
      try {
        const response = await createPrescriptionItem({
          prescriptionId,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          specialInstructions: item.specialInstructions || null,
          state: 1,
          createdBy: userId,
        });
        if (response.success) {
          setItem({
            medicineName: "",
            dosage: "",
            frequency: "",
            duration: "",
            specialInstructions: "",
          });
          onSuccess();
        } else {
          setError(response.message ?? "Error al agregar medicamento.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [item, prescriptionId, userId, onSuccess],
  );

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      {error ? (
        <p className="text-sm text-red-600">
          <i className="bi bi-exclamation-circle mr-1" />
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Medicamento *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: Acetaminofen 500mg"
            type="text"
            value={item.medicineName}
            onChange={handleMedicineName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Dosis *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: 500mg"
            type="text"
            value={item.dosage}
            onChange={handleDosage}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Frecuencia *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: Cada 8 horas"
            type="text"
            value={item.frequency}
            onChange={handleFrequency}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Duración *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: 7 días"
            type="text"
            value={item.duration}
            onChange={handleDuration}
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="font-bold text-sm">Instrucciones Especiales</label>
          <input
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: Tomar con alimentos"
            type="text"
            value={item.specialInstructions}
            onChange={handleSpecialInstructions}
          />
        </div>
      </div>
      <AsyncButton
        className="font-bold w-full"
        isLoading={submitting}
        loadingText="Agregando..."
        size="md"
        type="submit"
        variant="primary"
      >
        <i className="bi bi-plus-circle mr-2" /> Agregar Medicamento
      </AsyncButton>
    </form>
  );
}
