import { toast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Step1Patient } from "../../components/appointment/Step1Patient";
import { Step2Branch } from "../../components/appointment/Step2Branch";
import { Step3Specialty } from "../../components/appointment/Step3Specialty";
import { Step4Doctor } from "../../components/appointment/Step4Doctor";
import { Step5Slot } from "../../components/appointment/Step5Slot";
import { Step6Confirm } from "../../components/appointment/Step6Confirm";
import { StepIndicator } from "../../components/appointment/StepIndicator";
import {
  CONSULTATION_FEE,
  TOTAL_APPOINTMENT_STEPS,
  nameRoutes,
} from "../../configs/constants";
import { useAdminAppointmentHub } from "../../hooks/useAdminAppointmentHub";
import { useAuth } from "../../hooks/useAuth";
import {
  createAppointment,
  getAppointmentById,
} from "../../services/appointmentService";
import { getMedicalConsultationById } from "../../services/medicalConsultationService";
import type { BranchResponse } from "../../types/BranchResponse";
import type { DoctorResponse } from "../../types/PatientPortalTypes";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";

/** Follow-up type labels per RN-CU11-01 */
const FOLLOW_UP_TYPES = [
  { value: 1, label: "Monitoreo de Tratamiento" },
  { value: 2, label: "Revisión de Resultados de Laboratorio" },
] as const;

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  patient: { id: number; name: string } | null;
  branch: BranchResponse | null;
  specialty: SpecialtyResponse | null;
  doctor: DoctorResponse | null;
  appointmentDate: Date | null;
}

export function CreateAppointmentPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  // ── Follow-up detection ─────────────────────────────────────────────────
  const isFollowUp = searchParams.get("followUp") === "true";
  const parentConsultationId = searchParams.get("parentConsultationId");

  const [followUpType, setFollowUpType] = useState<number>(0);
  const [followUpLoading, setFollowUpLoading] = useState(isFollowUp);

  // ── Fetch parent consultation → parent appointment for pre-population ──
  const { data: consultationData } = useQuery({
    queryKey: ["followUp-consultation", parentConsultationId],
    queryFn: () => getMedicalConsultationById(Number(parentConsultationId)),
    enabled: isFollowUp && !!parentConsultationId,
  });

  const parentAppointmentId = consultationData?.success
    ? consultationData.data.appointmentId
    : null;

  const { data: appointmentData } = useQuery({
    queryKey: ["followUp-appointment", parentAppointmentId],
    queryFn: () => getAppointmentById(Number(parentAppointmentId)),
    enabled: !!parentAppointmentId,
  });

  const [wizard, setWizard] = useState<WizardState>({
    step: 1,
    patient: null,
    branch: null,
    specialty: null,
    doctor: null,
    appointmentDate: null,
  });

  const [slotConflictError, setSlotConflictError] = useState(false);
  const [hubDate, setHubDate] = useState<string | null>(null);

  // ── Pre-populate wizard when follow-up data arrives ─────────────────────
  useEffect(() => {
    if (!isFollowUp || !appointmentData?.success) return;
    const appt = appointmentData.data;

    setWizard({
      step: 5,
      patient: appt.patient
        ? { id: appt.patient.id, name: appt.patient.name ?? "" }
        : null,
      branch: appt.branch ?? null,
      specialty: appt.specialty ?? null,
      doctor: appt.doctor
        ? {
            id: appt.doctor.id,
            name: appt.doctor.name ?? "",
            specialtyId: appt.specialtyId,
            specialtyName: appt.specialty?.name,
          }
        : null,
      appointmentDate: null,
    });
    setFollowUpLoading(false);
  }, [isFollowUp, appointmentData]);

  const hub = useAdminAppointmentHub(wizard.doctor?.id ?? null, hubDate);

  // ── Follow-up context summary for display ───────────────────────────────
  const followUpSummary = useMemo(() => {
    if (!isFollowUp || !wizard.patient) return null;
    return {
      patientName: wizard.patient.name,
      doctorName: wizard.doctor?.name ?? "",
      specialtyName: wizard.specialty?.name ?? "",
      branchName: wizard.branch?.name ?? "",
    };
  }, [isFollowUp, wizard.patient, wizard.doctor, wizard.specialty, wizard.branch]);

  const handlePatientSelect = useCallback(
    (patient: { id: number; name: string }) =>
      setWizard((prev) => ({ ...prev, step: 2, patient })),
    [],
  );

  const handleBranchSelect = useCallback(
    (branch: BranchResponse) =>
      setWizard((prev) => ({ ...prev, step: 3, branch })),
    [],
  );

  const handleSpecialtySelect = useCallback(
    (specialty: SpecialtyResponse) =>
      setWizard((prev) => ({ ...prev, step: 4, specialty })),
    [],
  );

  const handleDoctorSelect = useCallback((doctor: DoctorResponse) => {
    setHubDate(null);
    setWizard((prev) => ({ ...prev, step: 5, doctor }));
  }, []);

  const handleSlotSelect = useCallback((dateTime: Date) => {
    setSlotConflictError(false);
    setWizard((prev) => ({ ...prev, step: 6, appointmentDate: dateTime }));
  }, []);

  const handleBackToStep1 = useCallback(
    () => setWizard((prev) => ({ ...prev, step: 1 })),
    [],
  );

  const handleBackToStep2 = useCallback(
    () => setWizard((prev) => ({ ...prev, step: 2 })),
    [],
  );

  const handleBackToStep3 = useCallback(
    () => setWizard((prev) => ({ ...prev, step: 3 })),
    [],
  );

  const handleBackToStep4 = useCallback(() => {
    setHubDate(null);
    setWizard((prev) => ({ ...prev, step: 4 }));
  }, []);

  const handleBackToStep5 = useCallback(
    () => setWizard((prev) => ({ ...prev, step: 5 })),
    [],
  );

  const handleConfirm = useCallback(
    async (reason: string, priority: number) => {
      if (
        !wizard.patient ||
        !wizard.branch ||
        !wizard.specialty ||
        !wizard.doctor ||
        !wizard.appointmentDate
      ) {
        throw new Error(
          "Datos incompletos. Por favor, complete todos los pasos.",
        );
      }

      // Validate follow-up type selection [RN-CU11-01]
      if (isFollowUp && !followUpType) {
        throw new Error(
          "Debe seleccionar el tipo de seguimiento antes de confirmar.",
        );
      }

      const response = await createAppointment({
        patientId: wizard.patient.id,
        doctorId: wizard.doctor.id,
        specialtyId: wizard.specialty.id,
        branchId: wizard.branch.id,
        appointmentStatusId: 1,
        appointmentDate: wizard.appointmentDate.toISOString(),
        reason,
        priority,
        amount: CONSULTATION_FEE,
        state: 1,
        createdBy: userId,
        ...(isFollowUp && {
          followUpType,
          parentConsultationId: Number(parentConsultationId),
        }),
      });

      if (response.success) {
        if (isFollowUp) {
          const typeLabel =
            FOLLOW_UP_TYPES.find((t) => t.value === followUpType)?.label ??
            String(followUpType);
          toast.success(
            `Cita de seguimiento agendada exitosamente. Tipo: ${typeLabel}. Paciente: ${wizard.patient.name}.`,
          );
        } else {
          toast.success("Cita agendada correctamente");
        }
        navigate(nameRoutes.appointment);
      } else {
        const isConflict =
          response.message?.toLowerCase().includes("disponible") ||
          response.message?.toLowerCase().includes("ocupado") ||
          response.message?.toLowerCase().includes("409");

        if (isConflict) {
          setSlotConflictError(true);
          setWizard((prev) => ({ ...prev, step: 5 }));
          throw new Error("El horario seleccionado ya no está disponible");
        }

        throw new Error(
          response.message ?? "Error al confirmar la cita. Intente de nuevo.",
        );
      }
    },
    [wizard, userId, navigate, isFollowUp, followUpType, parentConsultationId],
  );

  // ── Loading state for follow-up pre-population ──────────────────────────
  if (followUpLoading) {
    return (
      <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            <i className="bi bi-arrow-repeat animate-spin text-2xl mr-2" />
            Cargando datos de la consulta para cita de seguimiento...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            <i
              className={`bi ${isFollowUp ? "bi-calendar2-check" : "bi-calendar-plus"} mr-2 text-blue-600`}
            />
            {isFollowUp ? "Agendar Cita de Seguimiento" : "Crear Nueva Cita"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isFollowUp
              ? "Seleccione el tipo de seguimiento y un horario disponible."
              : "Complete los pasos para agendar una cita desde el panel administrativo."}
          </p>
        </div>

        {/* Follow-up context banner */}
        {isFollowUp && followUpSummary ? (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 dark:bg-green-900/20 dark:border-green-700">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
              <i className="bi bi-arrow-repeat mr-2" />
              Datos pre-cargados de la consulta
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-green-800 dark:text-green-200">
              <span>
                <strong>Paciente:</strong> {followUpSummary.patientName}
              </span>
              <span>
                <strong>Médico:</strong> {followUpSummary.doctorName}
              </span>
              <span>
                <strong>Especialidad:</strong> {followUpSummary.specialtyName}
              </span>
              <span>
                <strong>Sucursal:</strong> {followUpSummary.branchName}
              </span>
            </div>
          </div>
        ) : null}

        {/* Follow-up type selector [RN-CU11-01] */}
        {isFollowUp ? (
          <div className="mb-4 rounded-xl bg-white border p-4 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-md font-bold mb-3 text-gray-800 dark:text-gray-100">
              <i className="bi bi-clipboard2-pulse mr-2" />
              Tipo de Seguimiento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOLLOW_UP_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    followUpType === type.value
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                  }`}
                  type="button"
                  onClick={() => setFollowUpType(type.value)}
                >
                  <i
                    className={`bi ${
                      type.value === 1 ? "bi-heart-pulse" : "bi-file-earmark-medical"
                    } text-xl ${
                      followUpType === type.value
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      followUpType === type.value
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <StepIndicator current={wizard.step} total={TOTAL_APPOINTMENT_STEPS} />

        {slotConflictError ? (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            <i className="bi bi-exclamation-triangle-fill mr-2" />
            El horario seleccionado ya no está disponible. Por favor, elija otro
            horario.
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {wizard.step === 1 && <Step1Patient onSelect={handlePatientSelect} />}

          {wizard.step === 2 && (
            <Step2Branch
              onBack={handleBackToStep1}
              onSelect={handleBranchSelect}
            />
          )}

          {wizard.step === 3 && wizard.branch ? (
            <Step3Specialty
              branchId={wizard.branch.id}
              branchName={wizard.branch.name}
              onBack={handleBackToStep2}
              onSelect={handleSpecialtySelect}
            />
          ) : null}

          {wizard.step === 4 && wizard.branch && wizard.specialty ? (
            <Step4Doctor
              branchId={wizard.branch.id}
              branchName={wizard.branch.name}
              specialtyId={wizard.specialty.id}
              specialtyName={wizard.specialty.name}
              onBack={handleBackToStep3}
              onSelect={handleDoctorSelect}
            />
          ) : null}

          {wizard.step === 5 &&
          wizard.doctor &&
          wizard.specialty &&
          wizard.branch ? (
            <Step5Slot
              branchName={wizard.branch.name}
              doctorId={wizard.doctor.id}
              doctorName={wizard.doctor.name}
              hub={hub}
              specialtyName={wizard.specialty.name}
              onBack={isFollowUp ? () => navigate(-1) : handleBackToStep4}
              onDateChange={setHubDate}
              onSelect={handleSlotSelect}
            />
          ) : null}

          {wizard.step === 6 &&
          wizard.patient &&
          wizard.branch &&
          wizard.specialty &&
          wizard.doctor &&
          wizard.appointmentDate ? (
            <Step6Confirm
              summary={{
                patientId: wizard.patient.id,
                patientName: wizard.patient.name,
                branchId: wizard.branch.id,
                branchName: wizard.branch.name,
                specialtyId: wizard.specialty.id,
                specialtyName: wizard.specialty.name,
                doctorId: wizard.doctor.id,
                doctorName: wizard.doctor.name,
                appointmentDate: wizard.appointmentDate,
              }}
              onBack={handleBackToStep5}
              onConfirm={handleConfirm}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
