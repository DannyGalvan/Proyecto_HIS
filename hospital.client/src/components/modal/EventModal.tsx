import { useCallback, useState } from "react";
import { toast } from "@heroui/react";

import type { DoctorEventRequest, DoctorEventResponse } from "../../types/DoctorEventResponse";
import { EventTypeLabels } from "../../types/DoctorEventResponse";
import {
  createDoctorEvent,
  updateDoctorEvent,
  patchDoctorEvent,
} from "../../services/doctorEventService";

interface EventModalProps {
  event: DoctorEventResponse | null;
  userId: number;
  onClose: () => void;
  onSaved: () => void;
}

export function EventModal({ event, userId, onClose, onSaved }: EventModalProps) {
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventType, setEventType] = useState<number>(event?.eventType ?? 0);
  const [startDate, setStartDate] = useState(
    event?.startDate ? toLocalInputValue(event.startDate) : "",
  );
  const [endDate, setEndDate] = useState(
    event?.endDate ? toLocalInputValue(event.endDate) : "",
  );
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setError(null);

    // Validation
    if (!title || title.length < 5 || title.length > 200) {
      setError("El título debe contener entre 5 y 200 caracteres.");
      return;
    }
    if (!startDate) {
      setError("La fecha de inicio es requerida.");
      return;
    }
    if (!endDate) {
      setError("La fecha de fin es requerida.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    setSaving(true);
    try {
      const request: DoctorEventRequest = {
        doctorId: userId,
        title,
        description: description || null,
        eventType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isAllDay,
      };

      if (isEditing && event) {
        request.id = event.id;
        await updateDoctorEvent(request);
        toast.success(`Evento actualizado exitosamente. ${title}`);
      } else {
        await createDoctorEvent(request);
        toast.success(`Evento creado exitosamente. ${title} — ${new Date(startDate).toLocaleDateString("es-GT")} a ${new Date(endDate).toLocaleDateString("es-GT")}.`);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError("Error al guardar el evento. Intente de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [title, description, eventType, startDate, endDate, isAllDay, userId, isEditing, event, onSaved, onClose]);

  const handleDelete = useCallback(async () => {
    if (!event) return;
    setSaving(true);
    try {
      await patchDoctorEvent({ id: event.id, state: 0 });
      toast.success("Evento eliminado exitosamente.");
      onSaved();
      onClose();
    } catch {
      setError("Error al eliminar el evento.");
    } finally {
      setSaving(false);
    }
  }, [event, onSaved, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {isEditing ? "Editar Evento" : "Nuevo Evento"}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={onClose}
            type="button"
          >
            <i className="bi bi-x-lg text-xl" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del evento"
              type="text"
              value={title}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              value={description}
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Evento *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onChange={(e) => setEventType(Number(e.target.value))}
              value={eventType}
            >
              {Object.entries(EventTypeLabels).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Is All Day */}
          <div className="flex items-center gap-2">
            <input
              checked={isAllDay}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              id="isAllDay"
              onChange={(e) => setIsAllDay(e.target.checked)}
              type="checkbox"
            />
            <label className="text-sm font-medium" htmlFor="isAllDay">
              Todo el día
            </label>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Inicio *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) => setStartDate(e.target.value)}
                type={isAllDay ? "date" : "datetime-local"}
                value={startDate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fin *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) => setEndDate(e.target.value)}
                type={isAllDay ? "date" : "datetime-local"}
                value={endDate}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {isEditing && (
              <button
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                disabled={saving}
                onClick={handleDelete}
                type="button"
              >
                <i className="bi bi-trash mr-1" />
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              disabled={saving}
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={saving}
              onClick={handleSave}
              type="button"
            >
              {saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Convert ISO date string to datetime-local input value */
function toLocalInputValue(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    // Format as YYYY-MM-DDTHH:mm
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}
