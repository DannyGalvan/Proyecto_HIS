// ─── Confirmation step (step 4) ──────────────────────────────────────────────

import { useReservationTimer } from "../../hooks/useReservationTimer";
import { formatDateTimeLong } from "../../utils/dateFormatter";
import { AsyncButton } from "../button/AsyncButton";
import { CountdownTimer } from "../shared/CountdownTimer";
import type { CreateFormState } from "./EditForm";
import { SummaryRow } from "./SummaryRow";

interface ConfirmationStepProps {
  readonly state: CreateFormState;
  readonly onExpiry: () => void;
  readonly onSubmit: () => Promise<void>;
  readonly loading: boolean;
  readonly submitError: string | null;
}

export function ConfirmationStep({
  state,
  onExpiry,
  onSubmit,
  loading,
  submitError,
}: ConfirmationStepProps) {
  const { remaining, isExpired } = useReservationTimer(5, onExpiry);

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
          value={
            state.appointmentDate
              ? formatDateTimeLong(state.appointmentDate)
              : "—"
          }
        />
        <SummaryRow label="Motivo" value={state.reason} />
        {state.document ? (
          <SummaryRow label="Documento" value={state.document.name} />
        ) : null}
      </div>

      {submitError ? (
        <p className="text-red-600 text-sm text-center">{submitError}</p>
      ) : null}

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
