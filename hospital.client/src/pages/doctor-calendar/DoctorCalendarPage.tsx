import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg } from "@fullcalendar/core";

import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
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
            filters: `DoctorId==${userId},AppointmentDate>=${start},AppointmentDate<=${end}`,
            include: "Patient,Specialty,AppointmentStatus",
            includeTotal: false,
          }),
          getDoctorEvents({
            pageNumber: 1,
            pageSize: 200,
            filters: `DoctorId==${userId},StartDate<=${end},EndDate>=${start},State==1`,
            include: null,
            includeTotal: false,
          }),
          getDoctorTasks({
            pageNumber: 1,
            pageSize: 200,
            filters: `DoctorId==${userId},DueDate>=${start},DueDate<=${end},State==1`,
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

    // Appointments
    appointments.forEach((appt) => {
      const color = getAppointmentColor(appt.appointmentStatusId);
      const patientName = appt.patient?.name ?? "Paciente";
      const specialtyName = appt.specialty?.name ?? "";
      mapped.push({
        id: `appt-${appt.id}`,
        title: `${patientName}${specialtyName ? ` - ${specialtyName}` : ""}`,
        start: appt.appointmentDate,
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        extendedProps: { type: "appointment", data: appt },
      });
    });

    // Events
    events.forEach((evt) => {
      mapped.push({
        id: `event-${evt.id}`,
        title: evt.title,
        start: evt.startDate,
        end: evt.endDate,
        allDay: evt.isAllDay,
        backgroundColor: "#8b5cf6", // purple
        borderColor: "#7c3aed",
        textColor: "#ffffff",
        extendedProps: { type: "event", data: evt },
      });
    });

    // Tasks
    tasks.forEach((task) => {
      const isCompleted = task.isCompleted;
      mapped.push({
        id: `task-${task.id}`,
        title: task.title,
        start: task.dueDate,
        allDay: true,
        backgroundColor: isCompleted ? "#9ca3af" : "#f97316", // gray or orange
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

  const refreshData = useCallback(() => {
    if (dateRange) {
      loadData(dateRange.start, dateRange.end);
    }
  }, [dateRange, loadData]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi Calendario</h1>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
            onClick={handleCreateEvent}
            type="button"
          >
            <i className="bi bi-calendar-event" />
            Nuevo Evento
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            onClick={handleCreateTask}
            type="button"
          >
            <i className="bi bi-check2-square" />
            Nueva Tarea
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Calendar */}
        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-4 overflow-auto">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 z-10 flex items-center justify-center rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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

        {/* Task Panel */}
        <TaskPanel
          tasks={tasks}
          selectedDate={selectedDate}
          onRefresh={refreshData}
        />
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
