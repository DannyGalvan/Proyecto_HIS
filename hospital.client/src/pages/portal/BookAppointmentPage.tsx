import { toast } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Step1Branch } from "../../components/portal/Step1Branch";
import { Step2Specialty } from "../../components/portal/Step2Speciality";
import { Step3Doctor } from "../../components/portal/Step3Doctor";
import { Step4Slot } from "../../components/portal/Step4Slot";
import { StepIndicator } from "../../components/portal/StepIndicator";
import { Step5Confirm } from "../../components/pure/Step5Confirm";
import { CONSULTATION_FEE, nameRoutes } from "../../configs/constants";
import { useAppointmentHub } from "../../hooks/useAppointmentHub";
import { bookAppointment } from "../../services/patientPortalService";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";
import type { BranchResponse } from "../../types/BranchResponse";
import type { DoctorResponse } from "../../types/PatientPortalTypes";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import { formatLocalDateTime } from "../../utils/dateFormatter";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

// Wizard state
export interface WizardState {
  step: WizardStep;
  branch: BranchResponse | null;
  specialty: SpecialtyResponse | null;
  doctor: DoctorResponse | null;
  appointmentDate: Date | null;
}

// Page
export function Component() {
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
  const [hubDate, setHubDate] = useState<string | null>(null);

  // SignalR hub lives at the page level so the lock persists across wizard steps
  const hub = useAppointmentHub(wizard.doctor?.id ?? null, hubDate);

  // 5-minute reservation timer — tracks when step 5 was entered
  const [step5StartedAt, setStep5StartedAt] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [timerExpired, setTimerExpired] = useState(false);

  // Start timer when entering step 5
  useEffect(() => {
    if (wizard.step === 5 && step5StartedAt === null) {
      setStep5StartedAt(Date.now());
      setTimerExpired(false);
      setTimerRemaining(300);
    } else if (wizard.step !== 5) {
      setStep5StartedAt(null);
      setTimerExpired(false);
    }
  }, [wizard.step, step5StartedAt]);

  // Countdown interval
  useEffect(() => {
    if (step5StartedAt === null) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - step5StartedAt) / 1000);
      const left = Math.max(0, 300 - elapsed);
      setTimerRemaining(left);
      if (left <= 0) {
        setTimerExpired(true);
        clearInterval(interval);
        toast.danger(
          "El tiempo de reserva ha expirado. Seleccione un nuevo horario.",
        );
        setWizard((prev) => ({ ...prev, step: 4, appointmentDate: null }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step5StartedAt]);

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
        appointmentDate: formatLocalDateTime(wizard.appointmentDate),
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
            appointmentDate: formatLocalDateTime(wizard.appointmentDate),
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

  const handleWizardReset = useCallback(
    (step: WizardStep) => setWizard((prev) => ({ ...prev, step })),
    [],
  );
  const handleBackToStep1 = useCallback(
    () => handleWizardReset(1),
    [handleWizardReset],
  );
  const handleBackToStep2 = useCallback(
    () => handleWizardReset(2),
    [handleWizardReset],
  );
  const handleBackToStep3 = useCallback(
    () => handleWizardReset(3),
    [handleWizardReset],
  );
  const handleBackToStep4 = useCallback(
    () => handleWizardReset(4),
    [handleWizardReset],
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
              onBack={handleBackToStep1}
              onSelect={handleSpecialtySelect}
            />
          ) : null}
          {wizard.step === 3 && wizard.branch && wizard.specialty ? (
            <Step3Doctor
              branchId={wizard.branch.id}
              branchName={wizard.branch.name}
              specialtyId={wizard.specialty.id}
              specialtyName={wizard.specialty.name}
              onBack={handleBackToStep2}
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
              hub={hub}
              specialtyName={wizard.specialty.name}
              onBack={handleBackToStep3}
              onDateChange={setHubDate}
              onSelect={handleSlotSelect}
            />
          ) : null}
          {wizard.step === 5 &&
          wizard.branch &&
          wizard.specialty &&
          wizard.doctor &&
          wizard.appointmentDate ? (
            <Step5Confirm
              isExpired={timerExpired}
              remaining={timerRemaining}
              summary={{
                branchId: wizard.branch.id,
                branchName: wizard.branch.name,
                specialtyId: wizard.specialty.id,
                specialtyName: wizard.specialty.name,
                doctorId: wizard.doctor.id,
                doctorName: wizard.doctor.name,
                appointmentDate: wizard.appointmentDate,
              }}
              onBack={handleBackToStep4}
              onConfirm={handleConfirm}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

Component.displayName = "BookAppointmentPage";
