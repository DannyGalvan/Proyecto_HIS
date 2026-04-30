import { useCallback } from "react";

export interface ItemRow {
  key: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  specialInstructions: string;
}

interface PrescriptionItemFormProps {
  readonly row: ItemRow;
  readonly index: number;
  readonly canRemove: boolean;
  readonly onUpdate: (
    key: string,
    field: keyof Omit<ItemRow, "key">,
    value: string,
  ) => void;
  readonly onRemove: (key: string) => void;
}

export function PrescriptionItemForm({
  row,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: PrescriptionItemFormProps) {
  const handleMedicineName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onUpdate(row.key, "medicineName", e.target.value),
    [row.key, onUpdate],
  );
  const handleDosage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onUpdate(row.key, "dosage", e.target.value),
    [row.key, onUpdate],
  );
  const handleFrequency = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onUpdate(row.key, "frequency", e.target.value),
    [row.key, onUpdate],
  );
  const handleDuration = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onUpdate(row.key, "duration", e.target.value),
    [row.key, onUpdate],
  );
  const handleSpecialInstructions = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onUpdate(row.key, "specialInstructions", e.target.value),
    [row.key, onUpdate],
  );
  const handleRemove = useCallback(
    () => onRemove(row.key),
    [row.key, onRemove],
  );

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-600">
          Medicamento #{index + 1}
        </span>
        {canRemove ? (
          <button
            className="text-red-500 hover:text-red-700 text-sm"
            type="button"
            onClick={handleRemove}
          >
            <i className="bi bi-trash" /> Eliminar
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold">Medicamento *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: Acetaminofen 500mg"
            type="text"
            value={row.medicineName}
            onChange={handleMedicineName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold">Dosis *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: 500mg"
            type="text"
            value={row.dosage}
            onChange={handleDosage}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold">Frecuencia *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: Cada 8 horas"
            type="text"
            value={row.frequency}
            onChange={handleFrequency}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold">Duracion *</label>
          <input
            required
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: 7 dias"
            type="text"
            value={row.duration}
            onChange={handleDuration}
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-bold">Instrucciones Especiales</label>
          <input
            className="px-3 py-2 border rounded-md text-sm"
            placeholder="Ej: Tomar con alimentos"
            type="text"
            value={row.specialInstructions}
            onChange={handleSpecialInstructions}
          />
        </div>
      </div>
    </div>
  );
}
