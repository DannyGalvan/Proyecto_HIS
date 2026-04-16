import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import type { SingleValue } from "react-select";
import { AsyncButton } from "../button/AsyncButton";
import { CountdownTimer } from "../shared/CountdownTimer";
import { StepForm } from "../shared/StepForm";
import { useReservationTimer } from "../../hooks/useReservationTimer";
import { getBranches } from "../../services/branchService";
import { getSpecialties } from "../../services/specialtyService";
import { getUsers } from "../../services/userService";
import type { ApiResponse } from "../../types/ApiResponse";
import type { AppointmentRequest, AppointmentResponse } from "../../types/AppointmentResponse";
import type { BranchResponse } from "../../types/BranchResponse";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import type { UserResponse } from "../../types/UserResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { Response } from "../messages/Response";
import { CatalogueSelect } from "../select/CatalogueSelect";

// ─── Edit-mode imports (kept for the simple single-step edit flow) ───────────
import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback as useCallbackEdit, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { useForm } from "../../hooks/useForm";
import { getAppointmentStatuses } from "../../services/appointmentStatusService";
import type { AppointmentStatusResponse } from "../../types/AppointmentStatusResponse";
import { validateAppointment } from "../../validations/appointmentValidation";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";

// ─── Shared ──────────────────────────────────────────────────────────────────

interface AppointmentFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: AppointmentRequest;
  readonly onSubmit: (form: AppointmentRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
  readonly onSuccess?: (appointmentId: number) => void;
}

// ─── Document validation helper ──────────────────────────────────────────────

const validateDocument = (file: File): string | null => {
  if (file.type !== "application/pdf") return "Solo se permiten archivos PDF";
  if (file.size > 2097152) return "El archivo no puede superar 2MB";
  return null;
};

// ─── Step labels ─────────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Especialidad y Sucursal",
  "Médico y Fecha",
  "Motivo y Documento",
  "Confirmación",
];

// ─── Multi-step create form state ────────────────────────────────────────────

interface CreateFormState {
  specialtyId: string | null;
  specialtyLabel: string;
  branchId: string | null;
  branchLabel: string;
  doctorId: string | null;
  doctorLabel: string;
  appointmentDate: string;
  reason: string;
  document: File | null;
  documentError: string | null;
}

const initialCreateState: CreateFormState = {
  specialtyId: null,
  specialtyLabel: "",
  branchId: null,
  branchLabel: "",
  doctorId: null,
  doctorLabel: "",
  appointmentDate: "",
  reason: "",
  document: null,
  documentError: null,
};

// ─── Confirmation step (step 4) ──────────────────────────────────────────────

interface ConfirmationStepProps {
  state: CreateFormState;
  onExpiry: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  submitError: string | null;
}

function ConfirmationStep({ state, onExpiry, onSubmit, loading, submitError }: ConfirmationStepProps) {
  const { remaining, isExpired, reset } = useReservationTimer(5, onExpiry);

  if (isExpired) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-red-600 font-semibold text-lg">
          El tiempo de reserva ha expirado. Por favor, vuelva a intentarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <CountdownTimer label="Tiempo para confirmar" remaining={remaining} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex flex-col gap-3">
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          Resumen de la cita
        </h3>
        <SummaryRow label="Especialidad" value={state.specialtyLabel} />
        <SummaryRow label="Sucursal" value={state.branchLabel} />
        <SummaryRow label="Médico" value={state.doctorLabel} />
        <SummaryRow
          label="Fecha y hora"
          value={state.appointmentDate
            ? new Date(state.appointmentDate).toLocaleString("es-GT")
            : "—"}
        />
        <SummaryRow label="Motivo" value={state.reason} />
        {state.document && (
          <SummaryRow label="Documento" value={state.document.name} />
        )}
      </div>

      {submitError && (
        <p className="text-red-600 text-sm text-center">{submitError}</p>
      )}

      <div className="flex justify-end">
        <AsyncButton
          className="font-bold"
          isLoading={loading}
          loadingText="Agendando..."
          size="lg"
          type="button"
          variant="primary"
          onClick={onSubmit}
        >
          Confirmar y Agendar
        </AsyncButton>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-medium text-gray-600 min-w-[120px]">{label}:</span>
      <span className="text-gray-800">{value || "—"}</span>
    </div>
  );
}

// ─── Multi-step create form ───────────────────────────────────────────────────

interface MultiStepCreateFormProps {
  initialForm: AppointmentRequest;
  onSubmit: (form: AppointmentRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
  onSuccess?: (appointmentId: number) => void;
}

function MultiStepCreateForm({ initialForm, onSubmit, onSuccess }: MultiStepCreateFormProps) {
  const [searchParams] = useSearchParams();
  const followUp = searchParams.get("followUp") === "true";
  const parentConsultationId = searchParams.get("parentConsultationId");

  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState<CreateFormState>(initialCreateState);
  const [stepErrors, setStepErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  // Minimum datetime string for the date input (now)
  const minDateTime = new Date().toISOString().slice(0, 16);

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
    (item: UserResponse) => ({ label: `${item.name} (${item.userName})`, value: String(item.id) }),
    [],
  );

  // ── Step validation ────────────────────────────────────────────────────────

  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 0) {
      if (!formState.specialtyId) return "Debe seleccionar una especialidad.";
      if (!formState.branchId) return "Debe seleccionar una sucursal.";
    }
    if (currentStep === 1) {
      if (!formState.doctorId) return "Debe seleccionar un médico.";
      if (!formState.appointmentDate) return "Debe seleccionar una fecha y hora.";
      if (new Date(formState.appointmentDate) <= new Date()) {
        return "La fecha de la cita debe ser en el futuro.";
      }
    }
    if (currentStep === 2) {
      if (formState.reason.length < 10) return "El motivo debe tener al menos 10 caracteres.";
      if (formState.reason.length > 2000) return "El motivo no debe exceder 2000 caracteres.";
      if (formState.documentError) return formState.documentError;
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      setStepErrors(error);
      return;
    }
    setStepErrors(null);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepErrors(null);
    setStep((s) => s - 1);
  };

  // ── Expiry handler ─────────────────────────────────────────────────────────

  const handleExpiry = useCallback(() => {
    setStep(0);
    setFormState(initialCreateState);
    setStepErrors(null);
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
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
        parentConsultationId: parentConsultationId ? Number(parentConsultationId) : null,
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
  };

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
              onChange={(opt) => {
                const o = opt as SingleValue<{ label: string; value: string }>;
                setFormState((prev) => ({
                  ...prev,
                  specialtyId: o?.value ?? null,
                  specialtyLabel: o?.label ?? "",
                }));
              }}
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
              onChange={(opt) => {
                const o = opt as SingleValue<{ label: string; value: string }>;
                setFormState((prev) => ({
                  ...prev,
                  branchId: o?.value ?? null,
                  branchLabel: o?.label ?? "",
                }));
              }}
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
              onChange={(opt) => {
                const o = opt as SingleValue<{ label: string; value: string }>;
                setFormState((prev) => ({
                  ...prev,
                  doctorId: o?.value ?? null,
                  doctorLabel: o?.label ?? "",
                }));
              }}
            />
            <div className="flex flex-col gap-1">
              <label className="text-default-500 text-xs ms-1 font-medium" htmlFor="appointmentDate">
                Fecha y Hora de la Cita <span className="text-danger font-bold ml-1">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-default-100 hover:bg-default-200 transition-colors"
                id="appointmentDate"
                min={minDateTime}
                name="appointmentDate"
                type="datetime-local"
                value={formState.appointmentDate}
                onChange={(e) => {
                  setFormState((prev) => ({
                    ...prev,
                    appointmentDate: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3 — Motivo y Documento */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-default-500 text-xs ms-1 font-medium" htmlFor="reason">
                Motivo de Consulta (10–2000 caracteres){" "}
                <span className="text-danger font-bold ml-1">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md bg-default-100 hover:bg-default-200 transition-colors resize-y min-h-[100px]"
                id="reason"
                maxLength={2000}
                name="reason"
                placeholder="Describa el motivo de su consulta..."
                value={formState.reason}
                onChange={(e) => {
                  setFormState((prev) => ({ ...prev, reason: e.target.value }));
                }}
              />
              <p className="text-xs text-gray-400 text-right">
                {formState.reason.length}/2000
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-default-500 text-xs ms-1 font-medium" htmlFor="document">
                Documento de referencia (PDF, máx. 2MB — opcional)
              </label>
              <input
                accept="application/pdf"
                className="w-full px-3 py-2 border rounded-md bg-default-100 hover:bg-default-200 transition-colors"
                id="document"
                name="document"
                type="file"
                onChange={(e) => {
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
                }}
              />
              {formState.documentError && (
                <p className="text-danger text-sm ms-1">{formState.documentError}</p>
              )}
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
      {stepErrors && step < 3 && (
        <p className="mt-3 text-center text-sm text-red-600">{stepErrors}</p>
      )}
    </div>
  );
}

// ─── Edit-mode form (unchanged single-step) ───────────────────────────────────

interface EditFormProps {
  initialForm: AppointmentRequest;
  onSubmit: (form: AppointmentRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
}

function EditForm({ initialForm, onSubmit }: EditFormProps) {
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<AppointmentRequest, unknown>(initialForm, validateAppointment, onSubmit, true);

  const handleTextChange = useCallbackEdit(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  const handleSelectChange = useCallbackEdit(
    (name: string) => (opt: OptionValue) => {
      const option = opt as SingleValue<{ label: string; value: string }>;
      handleChange({ target: { name, value: option?.value || "" } } as React.ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  const handleStateChange = useCallbackEdit(
    (newValue: OptionValue) => {
      const value =
        newValue && !Array.isArray(newValue) && "value" in newValue
          ? Number((newValue as { value: string }).value)
          : null;
      handleChange({ target: { name: "state", value } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  const selectorUser = useCallbackEdit(
    (item: UserResponse) => ({ label: `${item.name} (${item.userName})`, value: String(item.id) }),
    [],
  );

  const selectorSpecialty = useCallbackEdit(
    (item: SpecialtyResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorBranch = useCallbackEdit(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorStatus = useCallbackEdit(
    (item: AppointmentStatusResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Editar Cita</h1>
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogueSelect
            isRequired
            defaultValue={
              form.patientId
                ? { label: String(form.patientId), value: String(form.patientId) }
                : null
            }
            deps="State:eq:1"
            errorMessage={errors?.patientId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.patientId}
            label="Paciente"
            name="patientId"
            placeholder="Buscar paciente..."
            queryFn={getUsers}
            selectorFn={selectorUser}
            onChange={handleSelectChange("patientId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={
              form.doctorId
                ? { label: String(form.doctorId), value: String(form.doctorId) }
                : null
            }
            deps="State:eq:1"
            errorMessage={errors?.doctorId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.doctorId}
            label="Médico"
            name="doctorId"
            placeholder="Buscar médico..."
            queryFn={getUsers}
            selectorFn={selectorUser}
            onChange={handleSelectChange("doctorId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={
              form.specialtyId
                ? { label: String(form.specialtyId), value: String(form.specialtyId) }
                : null
            }
            deps="State:eq:1"
            errorMessage={errors?.specialtyId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.specialtyId}
            label="Especialidad"
            name="specialtyId"
            placeholder="Seleccione especialidad"
            queryFn={getSpecialties}
            selectorFn={selectorSpecialty}
            onChange={handleSelectChange("specialtyId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={
              form.branchId
                ? { label: String(form.branchId), value: String(form.branchId) }
                : null
            }
            deps="State:eq:1"
            errorMessage={errors?.branchId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.branchId}
            label="Sucursal"
            name="branchId"
            placeholder="Seleccione sucursal"
            queryFn={getBranches}
            selectorFn={selectorBranch}
            onChange={handleSelectChange("branchId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={
              form.appointmentStatusId
                ? {
                    label: String(form.appointmentStatusId),
                    value: String(form.appointmentStatusId),
                  }
                : null
            }
            deps="State:eq:1"
            errorMessage={errors?.appointmentStatusId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.appointmentStatusId}
            label="Estado de Cita"
            name="appointmentStatusId"
            placeholder="Seleccione estado"
            queryFn={getAppointmentStatuses}
            selectorFn={selectorStatus}
            onChange={handleSelectChange("appointmentStatusId")}
          />
          <TextField
            isRequired
            className="w-full flex flex-col gap-1"
            isInvalid={!!errors?.appointmentDate}
            name="appointmentDate"
            onChange={handleTextChange("appointmentDate")}
          >
            <Label className="font-bold">Fecha y Hora de la Cita</Label>
            <Input
              className="w-full px-3 py-2 border rounded-md"
              type="datetime-local"
              value={form.appointmentDate || ""}
            />
            {errors?.appointmentDate ? (
              <FieldError>{errors.appointmentDate as string}</FieldError>
            ) : null}
          </TextField>
          <TextField
            isRequired
            className="w-full flex flex-col gap-1 md:col-span-2"
            isInvalid={!!errors?.reason}
            name="reason"
            onChange={handleTextChange("reason")}
          >
            <Label className="font-bold">Motivo de Consulta (10–2000 caracteres)</Label>
            <Input
              className="w-full px-3 py-2 border rounded-md"
              type="text"
              value={form.reason || ""}
            />
            {errors?.reason ? <FieldError>{errors.reason as string}</FieldError> : null}
          </TextField>
          <TextField
            className="w-full flex flex-col gap-1 md:col-span-2"
            isInvalid={!!errors?.notes}
            name="notes"
            onChange={handleTextChange("notes")}
          >
            <Label className="font-bold">Notas Adicionales</Label>
            <Input
              className="w-full px-3 py-2 border rounded-md"
              type="text"
              value={form.notes || ""}
            />
            {errors?.notes ? <FieldError>{errors.notes as string}</FieldError> : null}
          </TextField>
          <OptionsSelect
            isRequired
            defaultValue={
              form.state !== null && form.state !== undefined
                ? { label: form.state === 1 ? "Activo" : "Inactivo", value: String(form.state) }
                : { label: "Activo", value: "1" }
            }
            errorMessage={errors?.state as string}
            isInvalid={!!errors?.state}
            label="Estado"
            name="state"
            options={[
              { label: "Activo", value: "1" },
              { label: "Inactivo", value: "0" },
            ]}
            placeholder="Seleccione un estado"
            onChange={handleStateChange}
          />
        </div>
        <div className="flex gap-4 justify-end mt-4">
          <AsyncButton
            className="font-bold"
            isLoading={false}
            size="lg"
            type="button"
            variant="secondary"
            onClick={() => navigate("/appointment")}
          >
            Cancelar
          </AsyncButton>
          <AsyncButton
            className="font-bold"
            isLoading={loading}
            loadingText="Actualizando..."
            size="lg"
            type="submit"
            variant="primary"
          >
            Actualizar
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function AppointmentForm({ type, initialForm, onSubmit, onSuccess }: AppointmentFormProps) {
  if (type === "edit") {
    return <EditForm initialForm={initialForm} onSubmit={onSubmit} />;
  }
  return <MultiStepCreateForm initialForm={initialForm} onSubmit={onSubmit} onSuccess={onSuccess} />;
}
