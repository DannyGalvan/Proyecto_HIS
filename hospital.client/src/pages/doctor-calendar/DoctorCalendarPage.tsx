import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg } from "@fullcalendar/core";

import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { getAppTimezone } from "../../utils/dateFormatter";
import { getAppointments } from "../../services/appointmentService";
import { getDoctorEvents } from "../../services/doctorEventService";
import { getDoctorTasks } from "../../services/doctorTaskService";
import type { AppointmentResponse } from "../../types/AppointmentResponse";
import type { DoctorEventResponse } from "../../types/DoctorEventResponse";
import type { DoctorTaskResponse } from "../../types/DoctorTaskResponse";

import { EventModal } from "../../components/modal/EventModal";
import { TaskModal } from "../../components/modal/TaskModal";
import { TaskPanel } from "../../components/modal/TaskPanel";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  classNames?: string[];
  extendedProps: {
    type: "appointment" | "event" | "task";
    data: AppointmentResponse | DoctorEventResponse | DoctorTaskResponse;
  };
}

/** Map appointment status to color */
function getAppointmentColor(statusId: number): string {
  // 1=Pendiente(blue), 2=Confirmada(green), 3-6=En progreso(yellow), 7+=Completada(gray)
  if (statusId <= 1) return "#3b82f6"; // blue
  if (statusId === 2) return "#22c55e"; // green
  if (statusId >= 3 && statusId <= 6) return "#eab308"; // yellow
  return "#9ca3af"; // gray
}

/** Parse backend date strings (handles "dd/MM/yyyy HH:mm:ss" and ISO formats) */
function parseCalendarDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // ISO format
  if (dateStr.includes("T") || dateStr.endsWith("Z")) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  // Backend format: "dd/MM/yyyy HH:mm:ss"
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, day, month, year, hour, min, sec] = match;
    return new Date(Date.UTC(+year, +month - 1, +day, +hour, +min, +sec));
  }
  // Date-only: "dd/MM/yyyy"
  const dateOnly = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dateOnly) {
    const [, day, month, year] = dateOnly;
    return new Date(Date.UTC(+year, +month - 1, +day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Convert a UTC Date to a local datetime string in the user's timezone.
 * Returns format "YYYY-MM-DDTHH:mm:ss" (no Z suffix) so FullCalendar treats it as local.
 */
function toLocalCalendarString(utcDate: Date, tz: string): string {
  // Use Intl.DateTimeFormat to get the date parts in the target timezone
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(utcDate);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

export function DoctorCalendarPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [events, setEvents] = useState<DoctorEventResponse[]>([]);
  const [tasks, setTasks] = useState<DoctorTaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Modal states
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DoctorEventResponse | null>(null);
  const [editingTask, setEditingTask] = useState<DoctorTaskResponse | null>(null);

  // Date range for current view
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const loadData = useCallback(
    async (start: string, end: string) => {
      if (!userId) return;
      setLoading(true);
      try {
        const [apptRes, eventRes, taskRes] = await Promise.all([
          getAppointments({
            pageNumber: 1,
            pageSize: 200,
            filters: `DoctorId:eq:${userId} AND AppointmentDate:gte:${start} AND AppointmentDate:lte:${end}`,
            include: "Patient,Specialty,AppointmentStatus",
            includeTotal: false,
          }),
          getDoctorEvents({
            pageNumber: 1,
            pageSize: 200,
            filters: `DoctorId:eq:${userId} AND StartDate:lte:${end} AND EndDate:gte:${start} AND State:eq:1`,
            include: null,
            includeTotal: false,
          }),
          getDoctorTasks({
            pageNumber: 1,
            pageSize: 200,
            filters: `DoctorId:eq:${userId} AND DueDate:gte:${start} AND DueDate:lte:${end} AND State:eq:1`,
            include: null,
            includeTotal: false,
          }),
        ]);

        if (apptRes.success) setAppointments(apptRes.data);
        if (eventRes.success) setEvents(eventRes.data);
        if (taskRes.success) setTasks(taskRes.data);
      } catch (error) {
        console.error("Error loading calendar data:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const start = arg.startStr.split("T")[0];
      const end = arg.endStr.split("T")[0];
      setDateRange({ start, end });
      loadData(start, end);
    },
    [loadData],
  );

  // Map data to FullCalendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const mapped: CalendarEvent[] = [];
    const tz = getAppTimezone();

    // Appointments — only confirmed and beyond (exclude pendiente=1, no asistió=10, cancelada=11)
    const EXCLUDED_STATUSES = new Set([1, 10, 11]);
    appointments.forEach((appt) => {
      if (EXCLUDED_STATUSES.has(appt.appointmentStatusId)) return;
      const color = getAppointmentColor(appt.appointmentStatusId);
      const patientName = appt.patient?.name ?? "Paciente";
      const specialtyName = appt.specialty?.name ?? "";
      const startDate = parseCalendarDate(appt.appointmentDate);
      if (!startDate) return;
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
      mapped.push({
        id: `appt-${appt.id}`,
        title: `Cita #${appt.id} — ${patientName}${specialtyName ? ` (${specialtyName})` : ""}`,
        start: toLocalCalendarString(startDate, tz),
        end: toLocalCalendarString(endDate, tz),
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        extendedProps: { type: "appointment", data: appt },
      });
    });

    // Events
    events.forEach((evt) => {
      const evtStart = parseCalendarDate(evt.startDate);
      const evtEnd = parseCalendarDate(evt.endDate);
      mapped.push({
        id: `event-${evt.id}`,
        title: evt.title,
        start: evtStart ? toLocalCalendarString(evtStart, tz) : evt.startDate,
        end: evtEnd ? toLocalCalendarString(evtEnd, tz) : evt.endDate,
        allDay: evt.isAllDay,
        backgroundColor: "#8b5cf6",
        borderColor: "#7c3aed",
        textColor: "#ffffff",
        extendedProps: { type: "event", data: evt },
      });
    });

    // Tasks
    tasks.forEach((task) => {
      const isCompleted = task.isCompleted;
      const taskDate = parseCalendarDate(task.dueDate);
      mapped.push({
        id: `task-${task.id}`,
        title: task.title,
        start: taskDate ? toLocalCalendarString(taskDate, tz) : task.dueDate,
        allDay: true,
        backgroundColor: isCompleted ? "#9ca3af" : "#f97316",
        borderColor: isCompleted ? "#6b7280" : "#ea580c",
        textColor: "#ffffff",
        classNames: isCompleted ? ["line-through", "opacity-60"] : [],
        extendedProps: { type: "task", data: task },
      });
    });

    return mapped;
  }, [appointments, events, tasks]);

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const { type, data } = arg.event.extendedProps;
      if (type === "appointment") {
        navigate(nameRoutes.doctorDashboard);
      } else if (type === "event") {
        setEditingEvent(data as DoctorEventResponse);
        setEventModalOpen(true);
      } else if (type === "task") {
        setEditingTask(data as DoctorTaskResponse);
        setTaskModalOpen(true);
      }
    },
    [navigate],
  );

  const handleDateClick = useCallback((arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr.split("T")[0]);
  }, []);

  const handleCreateEvent = useCallback(() => {
    setEditingEvent(null);
    setEventModalOpen(true);
  }, []);

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setTaskModalOpen(true);
  }, []);

  const [taskPanelOpen, setTaskPanelOpen] = useState(true);

  // Resize calendar when task panel toggles or window resizes
  useEffect(() => {
    const timer = setTimeout(() => {
      calendarRef.current?.getApi().updateSize();
    }, 50);
    return () => clearTimeout(timer);
  }, [taskPanelOpen]);

  // Also listen for window resize
  useEffect(() => {
    const handleResize = () => calendarRef.current?.getApi().updateSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const refreshData = useCallback(() => {
    if (dateRange) {
      loadData(dateRange.start, dateRange.end);
    }
  }, [dateRange, loadData]);

  return (
    <div className="flex flex-col h-full gap-3 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Mi Calendario</h1>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors"
            onClick={handleCreateEvent}
            type="button"
          >
            <i className="bi bi-calendar-event" />
            <span className="hidden xs:inline">Nuevo</span> Evento
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs sm:text-sm font-medium hover:bg-orange-600 transition-colors"
            onClick={handleCreateTask}
            type="button"
          >
            <i className="bi bi-check2-square" />
            <span className="hidden xs:inline">Nueva</span> Tarea
          </button>
          <button
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              taskPanelOpen
                ? "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setTaskPanelOpen((prev) => !prev)}
            type="button"
          >
            <i className={`bi ${taskPanelOpen ? "bi-layout-sidebar-reverse" : "bi-list-task"}`} />
            <span className="hidden sm:inline">Tareas</span>
          </button>
        </div>
      </div>

      {/* Calendar + Task Panel */}
      <div className="flex flex-col lg:flex-row flex-1 gap-3 min-h-0">
        {/* Calendar */}
        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-2 sm:p-4 overflow-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 z-10 flex items-center justify-center rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            timeZone="local"
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridDay,timeGridWeek,dayGridMonth",
            }}
            locale="es"
            firstDay={1}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
            nowIndicator={true}
            selectable={false}
            editable={false}
            events={calendarEvents}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
            }}
          />
        </div>

        {/* Task Panel — collapsible */}
        {taskPanelOpen && (
          <div className="lg:w-80 lg:shrink-0">
            <TaskPanel
              tasks={tasks}
              selectedDate={selectedDate}
              onRefresh={refreshData}
            />
          </div>
        )}
      </div>

      {/* Event Modal */}
      {eventModalOpen && (
        <EventModal
          event={editingEvent}
          userId={userId}
          onClose={() => {
            setEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSaved={refreshData}
        />
      )}

      {/* Task Modal */}
      {taskModalOpen && (
        <TaskModal
          task={editingTask}
          userId={userId}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSaved={refreshData}
        />
      )}
    </div>
  );
}
