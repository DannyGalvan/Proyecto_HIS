import { toast } from "@heroui/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

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
import { createAppointment } from "../../services/appointmentService";
import type { BranchResponse } from "../../types/BranchResponse";
import type { DoctorResponse } from "../../types/PatientPortalTypes";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";

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

  const hub = useAdminAppointmentHub(wizard.doctor?.id ?? null, hubDate);

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
      });

      if (response.success) {
        toast.success("Cita agendada correctamente");
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
    [wizard, userId, navigate],
  );

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            <i className="bi bi-calendar-plus mr-2 text-blue-600" />
            Crear Nueva Cita
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete los pasos para agendar una cita desde el panel
            administrativo.
          </p>
        </div>

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
              onBack={handleBackToStep4}
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
