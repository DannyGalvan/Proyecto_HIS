import { useCallback, useState } from "react";

import type { DoctorTaskRequest, DoctorTaskResponse } from "../../types/DoctorTaskResponse";
import { PriorityLabels } from "../../types/DoctorTaskResponse";
import {
  createDoctorTask,
  updateDoctorTask,
  patchDoctorTask,
} from "../../services/doctorTaskService";

interface TaskModalProps {
  task: DoctorTaskResponse | null;
  userId: number;
  onClose: () => void;
  onSaved: () => void;
}

export function TaskModal({ task, userId, onClose, onSaved }: TaskModalProps) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? toDateInputValue(task.dueDate) : "",
  );
  const [priority, setPriority] = useState<number>(task?.priority ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setError(null);

    // Validation
    if (!title || title.length < 3 || title.length > 200) {
      setError("El título debe tener entre 3 y 200 caracteres.");
      return;
    }
    if (!dueDate) {
      setError("La fecha de vencimiento es requerida.");
      return;
    }

    setSaving(true);
    try {
      const request: DoctorTaskRequest = {
        doctorId: userId,
        title,
        description: description || null,
        dueDate: new Date(dueDate).toISOString(),
        priority,
      };

      if (isEditing && task) {
        request.id = task.id;
        await updateDoctorTask(request);
      } else {
        await createDoctorTask(request);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError("Error al guardar la tarea. Intente de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [title, description, dueDate, priority, userId, isEditing, task, onSaved, onClose]);

  const handleComplete = useCallback(async () => {
    if (!task) return;
    setSaving(true);
    try {
      await patchDoctorTask({ id: task.id, isCompleted: true });
      onSaved();
      onClose();
    } catch {
      setError("Error al completar la tarea.");
    } finally {
      setSaving(false);
    }
  }, [task, onSaved, onClose]);

  const handleDelete = useCallback(async () => {
    if (!task) return;
    setSaving(true);
    try {
      await patchDoctorTask({ id: task.id, state: 0 });
      onSaved();
      onClose();
    } catch {
      setError("Error al eliminar la tarea.");
    } finally {
      setSaving(false);
    }
  }, [task, onSaved, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {isEditing ? "Editar Tarea" : "Nueva Tarea"}
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              type="text"
              value={title}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              value={description}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Vencimiento *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onChange={(e) => setDueDate(e.target.value)}
              type="datetime-local"
              value={dueDate}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-1">Prioridad *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onChange={(e) => setPriority(Number(e.target.value))}
              value={priority}
            >
              {Object.entries(PriorityLabels).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            {isEditing && (
              <>
                <button
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  disabled={saving}
                  onClick={handleDelete}
                  type="button"
                >
                  <i className="bi bi-trash mr-1" />
                  Eliminar
                </button>
                {!task?.isCompleted && (
                  <button
                    className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    disabled={saving}
                    onClick={handleComplete}
                    type="button"
                  >
                    <i className="bi bi-check-lg mr-1" />
                    Completar
                  </button>
                )}
              </>
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
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
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
function toDateInputValue(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
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
