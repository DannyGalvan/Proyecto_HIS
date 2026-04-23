import type { ApiResponse } from "../../types/ApiResponse";
import type { AppointmentRequest } from "../../types/AppointmentResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { EditForm } from "../appointmentForm/EditForm";

// ─── Edit-mode imports (kept for the simple single-step edit flow) ───────────
import { MultiStepCreateForm } from "../appointmentForm/MultiStepCreateForm";

interface AppointmentFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: AppointmentRequest;
  readonly onSubmit: (
    form: AppointmentRequest,
  ) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
  readonly onSuccess?: (appointmentId: number) => void;
}

// ─── Public export ────────────────────────────────────────────────────────────

export function AppointmentForm({
  type,
  initialForm,
  onSubmit,
  onSuccess,
}: AppointmentFormProps) {
  if (type === "edit") {
    return <EditForm initialForm={initialForm} onSubmit={onSubmit} />;
  }
  return (
    <MultiStepCreateForm
      initialForm={initialForm}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />
  );
}
