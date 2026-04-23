import { useCallback } from "react";
import {
  PriorityLabels,
  type DoctorTaskResponse,
} from "../../types/DoctorTaskResponse";
import { formatTime } from "../../utils/reservationTimer";

export function TaskItem({
  task,
  completing,
  onComplete,
}: {
  readonly task: DoctorTaskResponse;
  readonly completing: boolean;
  readonly onComplete: (id: number) => void;
}) {
  const priorityInfo = PriorityLabels[task.priority] ?? PriorityLabels[1];

  const handleComplete = useCallback(
    () => onComplete(task.id),
    [task.id, onComplete],
  );

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        task.isCompleted
          ? "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 opacity-60"
          : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-orange-300 dark:hover:border-orange-700"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        {!task.isCompleted && (
          <button
            className="mt-0.5 shrink-0 w-5 h-5 rounded border-2 border-gray-300 dark:border-zinc-600 hover:border-orange-500 dark:hover:border-orange-400 flex items-center justify-center transition-colors disabled:opacity-50"
            disabled={completing}
            title="Marcar como completada"
            type="button"
            onClick={handleComplete}
          >
            {completing ? (
              <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : null}
          </button>
        )}
        {task.isCompleted ? (
          <div className="mt-0.5 shrink-0 w-5 h-5 rounded bg-green-500 flex items-center justify-center">
            <i className="bi bi-check text-white text-xs" />
          </div>
        ) : null}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              task.isCompleted
                ? "line-through text-gray-400 dark:text-gray-500"
                : ""
            }`}
          >
            {task.title}
          </p>
          {task.description ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {task.description}
            </p>
          ) : null}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${priorityInfo.color}`}
            >
              {priorityInfo.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(Number(task.dueDate))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
