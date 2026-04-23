import { useCallback, useMemo, useState } from "react";

import { patchDoctorTask } from "../../services/doctorTaskService";
import type { DoctorTaskResponse } from "../../types/DoctorTaskResponse";
import { FilterButton } from "../button/FilterButton";
import { TaskItem } from "../pure/TaskItem";

interface TaskPanelProps {
  readonly tasks: DoctorTaskResponse[];
  readonly selectedDate: string;
  readonly onRefresh: () => void;
}

type TaskFilter = "all" | "pending" | "completed";

export function TaskPanel({ tasks, selectedDate, onRefresh }: TaskPanelProps) {
  const [filter, setFilter] = useState<TaskFilter>("pending");
  const [completingId, setCompletingId] = useState<number | null>(null);

  const handleSetPending = useCallback(() => setFilter("pending"), []);
  const handleSetCompleted = useCallback(() => setFilter("completed"), []);
  const handleSetAll = useCallback(() => setFilter("all"), []);

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
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 flex flex-col overflow-hidden max-h-125 lg:max-h-none">
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
          onClick={handleSetPending}
        />
        <FilterButton
          active={filter === "completed"}
          label="Completadas"
          onClick={handleSetCompleted}
        />
        <FilterButton
          active={filter === "all"}
          label="Todas"
          onClick={handleSetAll}
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
              task={task}
              onComplete={handleComplete}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {
              tasks.filter((t) => {
                const taskDate = t.dueDate.split("T")[0];
                let normalizedDate = taskDate;
                if (t.dueDate.includes("/")) {
                  const match = t.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                  if (match)
                    normalizedDate = `${match[3]}-${match[2]}-${match[1]}`;
                }
                return normalizedDate === selectedDate && !t.isCompleted;
              }).length
            }{" "}
            pendientes
          </span>
          <span>
            {
              tasks.filter((t) => {
                const taskDate = t.dueDate.split("T")[0];
                let normalizedDate = taskDate;
                if (t.dueDate.includes("/")) {
                  const match = t.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                  if (match)
                    normalizedDate = `${match[3]}-${match[2]}-${match[1]}`;
                }
                return normalizedDate === selectedDate && t.isCompleted;
              }).length
            }{" "}
            completadas
          </span>
        </div>
      </div>
    </div>
  );
}
