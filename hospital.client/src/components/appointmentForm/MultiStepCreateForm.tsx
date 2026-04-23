// ─── Multi-step create form ───────────────────────────────────────────────────

import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import type { SingleValue } from "react-select";
import { initialCreateState, STEP_LABELS } from "../../configs/constants";
import { getBranches } from "../../services/branchService";
import { getSpecialties } from "../../services/specialtyService";
import { getUsers } from "../../services/userService";
import type { ApiResponse } from "../../types/ApiResponse";
import type {
  AppointmentRequest,
  AppointmentResponse,
} from "../../types/AppointmentResponse";
import type { BranchResponse } from "../../types/BranchResponse";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import type { UserResponse } from "../../types/UserResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { formatDateTimeLong } from "../../utils/dateFormatter";
import { validateDocument } from "../../utils/validateDocument";
import type { CreateFormState } from "../form/AppointmentForm";
import { Response } from "../messages/Response";
import { DynamicCalendar } from "../portal/DynamicCalendar";
import { CatalogueSelect } from "../select/CatalogueSelect";
import { StepForm } from "../shared/StepForm";
import { ConfirmationStep } from "./ConfirmationStep";

interface MultiStepCreateFormProps {
  readonly initialForm: AppointmentRequest;
  readonly onSubmit: (
    form: AppointmentRequest,
  ) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
  readonly onSuccess?: (appointmentId: number) => void;
}

export function MultiStepCreateForm({
  initialForm,
  onSubmit,
  onSuccess,
}: MultiStepCreateFormProps) {
  const [searchParams] = useSearchParams();
  const followUp = searchParams.get("followUp") === "true";
  const parentConsultationId = searchParams.get("parentConsultationId");

  const [step, setStep] = useState(0);
  const [formState, setFormState] =
    useState<CreateFormState>(initialCreateState);
  const [stepErrors, setStepErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  // ── Selectors ──────────────────────────────────────────────────────────────

  const selectorSpecialty = useCallback(
    (item: SpecialtyResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorBranch = useCallback(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorUser = useCallback(
    (item: UserResponse) => ({
      label: `${item.name} (${item.userName})`,
      value: String(item.id),
    }),
    [],
  );

  // ── Step validation ────────────────────────────────────────────────────────

  const validateStep = useCallback(
    (currentStep: number): string | null => {
      if (currentStep === 0) {
        if (!formState.specialtyId) return "Debe seleccionar una especialidad.";
        if (!formState.branchId) return "Debe seleccionar una sucursal.";
      }
      if (currentStep === 1) {
        if (!formState.doctorId) return "Debe seleccionar un médico.";
        if (!formState.appointmentDate)
          return "Debe seleccionar una fecha y hora.";
        if (new Date(formState.appointmentDate) <= new Date()) {
          return "La fecha de la cita debe ser en el futuro.";
        }
      }
      if (currentStep === 2) {
        if (formState.reason.length < 10)
          return "El motivo debe tener al menos 10 caracteres.";
        if (formState.reason.length > 2000)
          return "El motivo no debe exceder 2000 caracteres.";
        if (formState.documentError) return formState.documentError;
      }
      return null;
    },
    [formState],
  );

  const handleNext = useCallback(() => {
    const error = validateStep(step);
    if (error) {
      setStepErrors(error);
      return;
    }
    setStepErrors(null);
    setStep((s) => s + 1);
  }, [step, validateStep]);

  const handleBack = useCallback(() => {
    setStepErrors(null);
    setStep((s) => s - 1);
  }, []);

  // ── Expiry handler ─────────────────────────────────────────────────────────

  const handleExpiry = useCallback(() => {
    setStep(0);
    setFormState(initialCreateState);
    setStepErrors(null);
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setSubmitError(null);

    const request: AppointmentRequest = {
      ...initialForm,
      specialtyId: formState.specialtyId ? Number(formState.specialtyId) : null,
      branchId: formState.branchId ? Number(formState.branchId) : null,
      doctorId: formState.doctorId ? Number(formState.doctorId) : null,
      appointmentDate: formState.appointmentDate || null,
      reason: formState.reason,
      ...(followUp && {
        followUpType: 1,
        parentConsultationId: parentConsultationId
          ? Number(parentConsultationId)
          : null,
      }),
    };

    try {
      const response = await onSubmit(request);
      if (response.success) {
        setSubmitSuccess(true);
        setSubmitMessage(response.message ?? "Cita agendada correctamente");
        if (onSuccess) {
          const data = response.data as AppointmentResponse;
          onSuccess(data?.id ?? 0);
        }
      } else {
        setSubmitSuccess(false);
        setSubmitMessage(response.message ?? "Error al agendar la cita");
        setSubmitError(response.message ?? "Error al agendar la cita");
      }
    } catch {
      setSubmitSuccess(false);
      setSubmitError("Ocurrió un error inesperado. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [
    initialForm,
    formState,
    followUp,
    parentConsultationId,
    onSubmit,
    onSuccess,
  ]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSpecialtyChange = useCallback(
    (opt: SingleValue<{ label: string; value: string }> | unknown) => {
      const o = opt as SingleValue<{ label: string; value: string }>;
      setFormState((prev) => ({
        ...prev,
        specialtyId: o?.value ?? null,
        specialtyLabel: o?.label ?? "",
      }));
    },
    [],
  );

  const handleBranchChange = useCallback(
    (opt: SingleValue<{ label: string; value: string }> | unknown) => {
      const o = opt as SingleValue<{ label: string; value: string }>;
      setFormState((prev) => ({
        ...prev,
        branchId: o?.value ?? null,
        branchLabel: o?.label ?? "",
      }));
    },
    [],
  );

  const handleDoctorChange = useCallback(
    (opt: SingleValue<{ label: string; value: string }> | unknown) => {
      const o = opt as SingleValue<{ label: string; value: string }>;
      setFormState((prev) => ({
        ...prev,
        doctorId: o?.value ?? null,
        doctorLabel: o?.label ?? "",
        appointmentDate: "",
      }));
    },
    [],
  );

  const handleSlotSelected = useCallback((dateTime: Date) => {
    setFormState((prev) => ({
      ...prev,
      appointmentDate: dateTime.toISOString(),
    }));
  }, []);

  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, reason: e.target.value }));
    },
    [],
  );

  const handleDocumentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (file) {
        const error = validateDocument(file);
        setFormState((prev) => ({
          ...prev,
          document: error ? null : file,
          documentError: error,
        }));
      } else {
        setFormState((prev) => ({
          ...prev,
          document: null,
          documentError: null,
        }));
      }
    },
    [],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Agendar Cita</h1>

      {submitSuccess != null && (
        <div className="mb-4">
          <Response message={submitMessage} type={submitSuccess} />
        </div>
      )}

      <StepForm
        currentStep={step}
        steps={STEP_LABELS}
        onBack={handleBack}
        onNext={handleNext}
      >
        {/* Step 1 — Especialidad y Sucursal */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <CatalogueSelect<SpecialtyResponse>
              isRequired
              defaultValue={null}
              deps="State:eq:1"
              fieldSearch="Name"
              label="Especialidad"
              name="specialtyId"
              placeholder="Seleccione especialidad"
              queryFn={getSpecialties}
              selectorFn={selectorSpecialty}
              onChange={handleSpecialtyChange}
            />
            <CatalogueSelect<BranchResponse>
              isRequired
              defaultValue={null}
              deps="State:eq:1"
              fieldSearch="Name"
              label="Sucursal"
              name="branchId"
              placeholder="Seleccione sucursal"
              queryFn={getBranches}
              selectorFn={selectorBranch}
              onChange={handleBranchChange}
            />
          </div>
        )}

        {/* Step 2 — Médico y Fecha */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <CatalogueSelect<UserResponse>
              isRequired
              defaultValue={null}
              deps="State:eq:1"
              fieldSearch="Name"
              label="Médico"
              name="doctorId"
              placeholder="Buscar médico..."
              queryFn={getUsers}
              selectorFn={selectorUser}
              onChange={handleDoctorChange}
            />

            {formState.doctorId ? (
              <div className="flex flex-col gap-2">
                <label className="text-default-500 text-xs ms-1 font-medium">
                  Fecha y Hora de la Cita{" "}
                  <span className="text-danger font-bold ml-1">*</span>
                </label>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <DynamicCalendar
                    doctorId={Number(formState.doctorId)}
                    onSlotSelected={handleSlotSelected}
                  />
                </div>
                {formState.appointmentDate ? (
                  <p className="text-sm text-green-600 font-medium ms-1">
                    <i className="bi bi-check-circle mr-1" />
                    Horario seleccionado:{" "}
                    {formatDateTimeLong(formState.appointmentDate)}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-800/50">
                <i className="bi bi-calendar-event text-2xl block mb-2" />
                Seleccione un médico para ver la disponibilidad de horarios
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Motivo y Documento */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="text-default-500 text-xs ms-1 font-medium"
                htmlFor="reason"
              >
                Motivo de Consulta (10–2000 caracteres){" "}
                <span className="text-danger font-bold ml-1">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md bg-default-100 hover:bg-default-200 transition-colors resize-y min-h-25"
                id="reason"
                maxLength={2000}
                name="reason"
                placeholder="Describa el motivo de su consulta..."
                value={formState.reason}
                onChange={handleReasonChange}
              />
              <p className="text-xs text-gray-400 text-right">
                {formState.reason.length}/2000
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="text-default-500 text-xs ms-1 font-medium"
                htmlFor="document"
              >
                Documento de referencia (PDF, máx. 2MB — opcional)
              </label>
              <input
                accept="application/pdf"
                className="w-full px-3 py-2 border rounded-md bg-default-100 hover:bg-default-200 transition-colors"
                id="document"
                name="document"
                type="file"
                onChange={handleDocumentChange}
              />
              {formState.documentError ? (
                <p className="text-danger text-sm ms-1">
                  {formState.documentError}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Step 4 — Confirmación */}
        {step === 3 && (
          <ConfirmationStep
            loading={loading}
            state={formState}
            submitError={submitError}
            onExpiry={handleExpiry}
            onSubmit={handleSubmit}
          />
        )}
      </StepForm>

      {/* Per-step validation error */}
      {stepErrors && step < 3 ? (
        <p className="mt-3 text-center text-sm text-red-600">{stepErrors}</p>
      ) : null}
    </div>
  );
}
