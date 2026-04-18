import { useCallback, useMemo, useState } from "react";

import type { DoctorTaskResponse } from "../../types/DoctorTaskResponse";
import { PriorityLabels } from "../../types/DoctorTaskResponse";
import { patchDoctorTask } from "../../services/doctorTaskService";
import { formatTime } from "../../utils/dateFormatter";

interface TaskPanelProps {
  tasks: DoctorTaskResponse[];
  selectedDate: string;
  onRefresh: () => void;
}

type TaskFilter = "all" | "pending" | "completed";

export function TaskPanel({ tasks, selectedDate, onRefresh }: TaskPanelProps) {
  const [filter, setFilter] = useState<TaskFilter>("pending");
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Filter tasks for selected date
  const dayTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const taskDate = task.dueDate.split("T")[0];
        // Handle backend date format "dd/MM/yyyy HH:mm:ss"
        let normalizedDate = taskDate;
        if (task.dueDate.includes("/")) {
          const match = task.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
          if (match) {
            normalizedDate = `${match[3]}-${match[2]}-${match[1]}`;
          }
        }
        return normalizedDate === selectedDate;
      })
      .filter((task) => {
        if (filter === "pending") return !task.isCompleted;
        if (filter === "completed") return task.isCompleted;
        return true;
      })
      .sort((a, b) => b.priority - a.priority); // Alta (2) first, Baja (0) last
  }, [tasks, selectedDate, filter]);

  const handleComplete = useCallback(
    async (taskId: number) => {
      setCompletingId(taskId);
      try {
        await patchDoctorTask({ id: taskId, isCompleted: true });
        onRefresh();
      } catch (error) {
        console.error("Error completing task:", error);
      } finally {
        setCompletingId(null);
      }
    },
    [onRefresh],
  );

  const formatSelectedDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr + "T12:00:00");
      return d.toLocaleDateString("es-GT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-80 shrink-0 bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg font-bold mb-1">Tareas del Día</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {formatSelectedDate(selectedDate)}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
        <FilterButton
          active={filter === "pending"}
          label="Pendientes"
          onClick={() => setFilter("pending")}
        />
        <FilterButton
          active={filter === "completed"}
          label="Completadas"
          onClick={() => setFilter("completed")}
        />
        <FilterButton
          active={filter === "all"}
          label="Todas"
          onClick={() => setFilter("all")}
        />
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
        {dayTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <i className="bi bi-check2-all text-3xl mb-2 block" />
            <p className="text-sm">
              {filter === "pending"
                ? "No hay tareas pendientes"
                : filter === "completed"
                  ? "No hay tareas completadas"
                  : "No hay tareas para este día"}
            </p>
          </div>
        ) : (
          dayTasks.map((task) => (
            <TaskItem
              key={task.id}
              completing={completingId === task.id}
              onComplete={handleComplete}
              task={task}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {tasks.filter((t) => {
              const taskDate = t.dueDate.split("T")[0];
              let normalizedDate = taskDate;
              if (t.dueDate.includes("/")) {
                const match = t.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                if (match) normalizedDate = `${match[3]}-${match[2]}-${match[1]}`;
              }
              return normalizedDate === selectedDate && !t.isCompleted;
            }).length}{" "}
            pendientes
          </span>
          <span>
            {tasks.filter((t) => {
              const taskDate = t.dueDate.split("T")[0];
              let normalizedDate = taskDate;
              if (t.dueDate.includes("/")) {
                const match = t.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                if (match) normalizedDate = `${match[3]}-${match[2]}-${match[1]}`;
              }
              return normalizedDate === selectedDate && t.isCompleted;
            }).length}{" "}
            completadas
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active
          ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TaskItem({
  task,
  completing,
  onComplete,
}: {
  task: DoctorTaskResponse;
  completing: boolean;
  onComplete: (id: number) => void;
}) {
  const priorityInfo = PriorityLabels[task.priority] ?? PriorityLabels[1];

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
            onClick={() => onComplete(task.id)}
            title="Marcar como completada"
            type="button"
          >
            {completing && (
              <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        )}
        {task.isCompleted && (
          <div className="mt-0.5 shrink-0 w-5 h-5 rounded bg-green-500 flex items-center justify-center">
            <i className="bi bi-check text-white text-xs" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              task.isCompleted ? "line-through text-gray-400 dark:text-gray-500" : ""
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${priorityInfo.color}`}
            >
              {priorityInfo.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(task.dueDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
