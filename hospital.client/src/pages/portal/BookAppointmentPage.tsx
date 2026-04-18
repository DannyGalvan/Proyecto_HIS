import { toast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

import { DynamicCalendar } from "../../components/portal/DynamicCalendar";
import { nameRoutes } from "../../configs/constants";
import { getBranches } from "../../services/branchService";
import {
  bookAppointment,
  getDoctorsByBranchAndSpecialty,
  getSpecialtiesByBranch,
} from "../../services/patientPortalService";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";
import type { BranchResponse } from "../../types/BranchResponse";
import type { DoctorResponse } from "../../types/PatientPortalTypes";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import { formatDateLong, formatTime } from "../../utils/dateFormatter";

// Constants
const CONSULTATION_FEE = 150.0;

const SPECIALTY_ICONS: Record<string, string> = {
  Cardiologia: "bi-heart-pulse",
  Pediatria: "bi-person-hearts",
  Neurologia: "bi-brain",
  Ortopedia: "bi-bandaid",
  Ginecologia: "bi-gender-female",
  Dermatologia: "bi-droplet",
  Oftalmologia: "bi-eye",
  "Medicina General": "bi-clipboard2-pulse",
};

// Step indicator
function StepIndicator({
  current,
  total,
}: {
  readonly current: number;
  readonly total: number;
}) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${isActive ? "bg-blue-600 text-white" : isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}
            >
              {isDone ? <i className="bi bi-check-lg" /> : step}
            </div>
            {step < total && (
              <div
                className={`h-0.5 w-8 ${isDone ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Step 1: Branch selection
function Step1Branch({
  onSelect,
}: {
  readonly onSelect: (branch: BranchResponse) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-branches"],
    queryFn: () =>
      getBranches({
        pageNumber: 1,
        pageSize: 50,
        filters: "State:eq:1",
        include: null,
        includeTotal: false,
      }),
    staleTime: 1000 * 60 * 10,
  });
  const branches = data?.success ? data.data : [];
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione una Sede
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Elija la sede donde desea atenderse.
      </p>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <i className="bi bi-exclamation-triangle mr-2" />
          Error al cargar sedes. Intente de nuevo.
        </div>
      ) : null}
      {!isLoading && !isError && branches.length === 0 && (
        <p className="text-center text-gray-400">No hay sedes disponibles.</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {branches.map((b) => (
          <button
            key={b.id}
            className="flex items-start gap-4 rounded-xl border border-gray-200 p-5 text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500"
            type="button"
            onClick={() => onSelect(b)}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <i className="bi bi-building text-2xl text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {b.name}
              </p>
              {b.address ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <i className="bi bi-geo-alt mr-1" />
                  {b.address}
                </p>
              ) : null}
              {b.phone ? (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  <i className="bi bi-telephone mr-1" />
                  {b.phone}
                </p>
              ) : null}
            </div>
            <i className="bi bi-chevron-right ml-auto self-center text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Specialty selection (filtered by branch)
function Step2Specialty({
  branchId,
  branchName,
  onSelect,
  onBack,
}: {
  readonly branchId: number;
  readonly branchName: string;
  readonly onSelect: (specialty: SpecialtyResponse) => void;
  readonly onBack: () => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-specialties-branch", branchId],
    queryFn: () => getSpecialtiesByBranch(branchId),
    staleTime: 1000 * 60 * 10,
  });
  const specialties = data?.success ? data.data : [];
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione una Especialidad
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Sede: <span className="font-semibold text-blue-600">{branchName}</span>
      </p>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <i className="bi bi-exclamation-triangle mr-2" />
          Error al cargar especialidades. Intente de nuevo.
        </div>
      ) : null}
      {!isLoading && !isError && specialties.length === 0 && (
        <p className="text-center text-gray-400">
          No se encontraron especialidades disponibles en la sucursal{" "}
          {branchName}. Por favor, seleccione otra sede.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {specialties.map((s) => {
          const icon = SPECIALTY_ICONS[s.name] ?? "bi-hospital";
          return (
            <button
              key={s.id}
              className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-5 text-center shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500"
              type="button"
              onClick={() => onSelect(s)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <i
                  className={`bi ${icon} text-2xl text-blue-600 dark:text-blue-300`}
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {s.name}
              </span>
            </button>
          );
        })}
      </div>
      <button
        className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        type="button"
        onClick={onBack}
      >
        <i className="bi bi-arrow-left" />
        Volver a sedes
      </button>
    </div>
  );
}

// Step 3: Doctor selection (filtered by branch + specialty)
function Step3Doctor({
  branchId,
  specialtyId,
  specialtyName,
  branchName,
  onSelect,
  onBack,
}: {
  readonly branchId: number;
  readonly specialtyId: number;
  readonly specialtyName: string;
  readonly branchName: string;
  readonly onSelect: (doctor: DoctorResponse) => void;
  readonly onBack: () => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-doctors", branchId, specialtyId],
    queryFn: () => getDoctorsByBranchAndSpecialty(branchId, specialtyId),
    staleTime: 1000 * 60 * 5,
  });
  const doctors = data?.success ? data.data : [];
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione un Medico
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-blue-600">{branchName}</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-semibold text-blue-600">{specialtyName}</span>
      </p>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <i className="bi bi-exclamation-triangle mr-2" />
          Error al cargar medicos. Intente de nuevo.
        </div>
      ) : null}
      {!isLoading && !isError && doctors.length === 0 && (
        <p className="text-center text-gray-400">
          No se encontraron horarios disponibles para la especialidad{" "}
          {specialtyName} en la sucursal {branchName}. Por favor, seleccione
          otra especialidad o sede.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {doctors.map((d) => (
          <button
            key={d.id}
            className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500"
            type="button"
            onClick={() => onSelect(d)}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
              <i className="bi bi-person-badge text-2xl text-cyan-600 dark:text-cyan-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {d.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {d.specialtyName ?? specialtyName}
              </p>
            </div>
            <i className="bi bi-chevron-right ml-auto text-gray-400" />
          </button>
        ))}
      </div>
      <button
        className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        type="button"
        onClick={onBack}
      >
        <i className="bi bi-arrow-left" />
        Volver a especialidades
      </button>
    </div>
  );
}

// Step 4: Date/Time slot selection
function Step4Slot({
  doctorId,
  doctorName,
  specialtyName,
  branchName,
  onSelect,
  onBack,
}: {
  readonly doctorId: number;
  readonly doctorName: string;
  readonly specialtyName: string;
  readonly branchName: string;
  readonly onSelect: (dateTime: Date) => void;
  readonly onBack: () => void;
}) {
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const handleSlotSelected = useCallback((dt: Date) => setSelectedSlot(dt), []);
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione Fecha y Horario
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-blue-600">{branchName}</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-semibold text-blue-600">{specialtyName}</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-semibold text-blue-600">{doctorName}</span>
      </p>
      <div className="rounded-xl border border-gray-200  p-4 dark:border-gray-700  mb-4">
        <DynamicCalendar
          doctorId={doctorId}
          onSlotSelected={handleSlotSelected}
        />
      </div>
      {selectedSlot ? (
        <p className="mb-4 text-sm text-green-600 font-medium">
          <i className="bi bi-check-circle mr-1" />
          Horario seleccionado: {formatDateLong(selectedSlot.toISOString())}
        </p>
      ) : null}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          type="button"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left" />
          Volver a medicos
        </button>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedSlot}
          type="button"
          onClick={() => selectedSlot && onSelect(selectedSlot)}
        >
          Continuar
          <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}

// Step 5: Confirm with reason
interface SummaryData {
  branchId: number;
  branchName: string;
  specialtyId: number;
  specialtyName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: Date;
}

function Step5Confirm({
  summary,
  onBack,
  onConfirm,
}: {
  readonly summary: SummaryData;
  readonly onBack: () => void;
  readonly onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const handleSubmit = useCallback(async () => {
    setReasonError("");
    setApiError("");
    if (reason.trim().length < 10) {
      setReasonError("El motivo debe tener al menos 10 caracteres.");
      return;
    }
    if (reason.trim().length > 2000) {
      setReasonError("El motivo no puede superar 2000 caracteres.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Error al confirmar la cita.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [reason, onConfirm]);
  const formattedDate = formatDateLong(summary.appointmentDate.toISOString());
  const formattedTime = formatTime(summary.appointmentDate.toISOString());
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Confirmar Cita
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Revise los detalles y proporcione el motivo de su consulta.
      </p>
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-3 font-bold text-blue-800 dark:text-blue-300">
          <i className="bi bi-clipboard2-check mr-2" />
          Resumen de la Cita
        </h3>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Sede</dt>
            <dd className="font-semibold text-gray-800 dark:text-gray-100">
              {summary.branchName}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Especialidad</dt>
            <dd className="font-semibold text-gray-800 dark:text-gray-100">
              {summary.specialtyName}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Medico</dt>
            <dd className="font-semibold text-gray-800 dark:text-gray-100">
              {summary.doctorName}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Fecha</dt>
            <dd className="font-semibold text-gray-800 dark:text-gray-100">
              {formattedDate}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Hora</dt>
            <dd className="font-semibold text-gray-800 dark:text-gray-100">
              {formattedTime}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Honorario</dt>
            <dd className="font-bold text-blue-700 dark:text-blue-300">
              Q{CONSULTATION_FEE.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>
      <div className="mb-6 flex flex-col gap-1">
        <label
          className="text-sm font-bold text-gray-700 dark:text-gray-300"
          htmlFor="reason"
        >
          Motivo de la Consulta *
        </label>
        <textarea
          className={`w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${reasonError ? "border-red-400 bg-red-50 dark:bg-red-900/20" : "border-gray-300 dark:border-gray-600"}`}
          id="reason"
          maxLength={2000}
          minLength={10}
          placeholder="Describa brevemente el motivo de su consulta (minimo 10 caracteres)..."
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setReasonError("");
          }}
        />
        <div className="flex justify-between">
          {reasonError ? (
            <p className="text-xs text-red-500">
              <i className="bi bi-exclamation-circle mr-1" />
              {reasonError}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">{reason.length}/2000</span>
        </div>
      </div>
      {apiError ? (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          <i className="bi bi-exclamation-triangle-fill mr-2" />
          {apiError}
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          disabled={isSubmitting}
          type="button"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left" />
          Volver
        </button>
        <button
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
          type="button"
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? (
            <>
              <i className="bi bi-hourglass-split animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle" />
              Confirmar Cita
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Wizard state
interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  branch: BranchResponse | null;
  specialty: SpecialtyResponse | null;
  doctor: DoctorResponse | null;
  appointmentDate: Date | null;
}

// Page
export function BookAppointmentPage() {
  const navigate = useNavigate();
  const { userId } = usePatientAuthStore();
  const [wizard, setWizard] = useState<WizardState>({
    step: 1,
    branch: null,
    specialty: null,
    doctor: null,
    appointmentDate: null,
  });
  const [slotConflictError, setSlotConflictError] = useState(false);
  const handleBranchSelect = useCallback(
    (branch: BranchResponse) =>
      setWizard((prev) => ({ ...prev, step: 2, branch })),
    [],
  );
  const handleSpecialtySelect = useCallback(
    (specialty: SpecialtyResponse) =>
      setWizard((prev) => ({ ...prev, step: 3, specialty })),
    [],
  );
  const handleDoctorSelect = useCallback(
    (doctor: DoctorResponse) =>
      setWizard((prev) => ({ ...prev, step: 4, doctor })),
    [],
  );
  const handleSlotSelect = useCallback((dateTime: Date) => {
    setSlotConflictError(false);
    setWizard((prev) => ({ ...prev, step: 5, appointmentDate: dateTime }));
  }, []);
  const handleConfirm = useCallback(
    async (reason: string) => {
      if (
        !wizard.branch ||
        !wizard.specialty ||
        !wizard.doctor ||
        !wizard.appointmentDate
      )
        throw new Error(
          "Datos incompletos. Por favor, complete todos los pasos.",
        );
      const response = await bookAppointment({
        patientId: userId,
        doctorId: wizard.doctor.id,
        specialtyId: wizard.specialty.id,
        branchId: wizard.branch.id,
        appointmentDate: wizard.appointmentDate.toISOString(),
        reason,
        amount: CONSULTATION_FEE,
      });
      if (response.success && response.data) {
        toast.success(
          "Su cita ha sido registrada exitosamente. Será redirigido al proceso de pago para confirmar la reserva.",
        );
        navigate(nameRoutes.portalPay, {
          state: {
            appointmentId: response.data.appointmentId,
            createdAt: response.data.createdAt,
            doctorName: wizard.doctor.name,
            specialtyName: wizard.specialty.name,
            branchName: wizard.branch.name,
            appointmentDate: wizard.appointmentDate.toISOString(),
            amount: CONSULTATION_FEE,
          },
        });
      } else {
        const isConflict =
          response.message?.toLowerCase().includes("disponible") ||
          response.message?.toLowerCase().includes("ocupado") ||
          response.message?.toLowerCase().includes("409");
        if (isConflict) {
          setSlotConflictError(true);
          setWizard((prev) => ({ ...prev, step: 4 }));
          throw new Error("El horario seleccionado ya no esta disponible");
        }
        throw new Error(
          response.message ?? "Error al confirmar la cita. Intente de nuevo.",
        );
      }
    },
    [wizard, userId, navigate],
  );
  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-800">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            <i className="bi bi-calendar-plus mr-2 text-blue-600" />
            Agendar Nueva Cita
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete los pasos para reservar su consulta medica.
          </p>
        </div>
        <StepIndicator current={wizard.step} total={5} />
        {slotConflictError ? (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            <i className="bi bi-exclamation-triangle-fill mr-2" />
            El horario seleccionado ya no esta disponible. Por favor, elija otro
            horario.
          </div>
        ) : null}
        <div className="rounded-2xl border border-gray-100 p-6 shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900/50">
          {wizard.step === 1 && <Step1Branch onSelect={handleBranchSelect} />}
          {wizard.step === 2 && wizard.branch ? (
            <Step2Specialty
              branchId={wizard.branch.id}
              branchName={wizard.branch.name}
              onBack={() => setWizard((prev) => ({ ...prev, step: 1 }))}
              onSelect={handleSpecialtySelect}
            />
          ) : null}
          {wizard.step === 3 && wizard.branch && wizard.specialty ? (
            <Step3Doctor
              branchId={wizard.branch.id}
              branchName={wizard.branch.name}
              specialtyId={wizard.specialty.id}
              specialtyName={wizard.specialty.name}
              onBack={() => setWizard((prev) => ({ ...prev, step: 2 }))}
              onSelect={handleDoctorSelect}
            />
          ) : null}
          {wizard.step === 4 &&
          wizard.doctor &&
          wizard.specialty &&
          wizard.branch ? (
            <Step4Slot
              branchName={wizard.branch.name}
              doctorId={wizard.doctor.id}
              doctorName={wizard.doctor.name}
              specialtyName={wizard.specialty.name}
              onBack={() => setWizard((prev) => ({ ...prev, step: 3 }))}
              onSelect={handleSlotSelect}
            />
          ) : null}
          {wizard.step === 5 &&
          wizard.branch &&
          wizard.specialty &&
          wizard.doctor &&
          wizard.appointmentDate ? (
            <Step5Confirm
              summary={{
                branchId: wizard.branch.id,
                branchName: wizard.branch.name,
                specialtyId: wizard.specialty.id,
                specialtyName: wizard.specialty.name,
                doctorId: wizard.doctor.id,
                doctorName: wizard.doctor.name,
                appointmentDate: wizard.appointmentDate,
              }}
              onBack={() => setWizard((prev) => ({ ...prev, step: 4 }))}
              onConfirm={handleConfirm}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default BookAppointmentPage;

export function Component() {
  return <BookAppointmentPage />;
}
Component.displayName = "BookAppointmentPage";
