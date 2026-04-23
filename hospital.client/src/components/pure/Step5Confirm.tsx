import { useCallback, useState } from "react";
import { CONSULTATION_FEE } from "../../configs/constants";
import { formatDateLong, formatTime } from "../../utils/dateFormatter";

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

export function Step5Confirm({
  summary,
  remaining,
  isExpired,
  onBack,
  onConfirm,
}: {
  readonly summary: SummaryData;
  readonly remaining: number;
  readonly isExpired: boolean;
  readonly onBack: () => void;
  readonly onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const timerMinutes = Math.floor(remaining / 60);
  const timerSeconds = remaining % 60;
  const timerDisplay = `${String(timerMinutes).padStart(2, "0")}:${String(timerSeconds).padStart(2, "0")}`;
  const isUrgent = remaining <= 60; // last minute = red

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

  const handleReason = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= 2000) {
        setReason(e.target.value);
        if (reasonError) setReasonError("");
      }
    },
    [reasonError],
  );

  const handleSubmitClick = useCallback(
    () => void handleSubmit(),
    [handleSubmit],
  );

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Confirmar Cita
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Revise los detalles y proporcione el motivo de su consulta.
      </p>

      {/* Reservation timer */}
      <div
        className={`mb-4 flex items-center gap-2 rounded-xl border p-3 ${
          isExpired
            ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
            : isUrgent
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10"
        }`}
      >
        <i
          className={`bi ${isExpired ? "bi-exclamation-triangle-fill" : "bi-clock-history"} text-lg ${
            isExpired || isUrgent ? "text-red-600" : "text-amber-600"
          }`}
        />
        {isExpired ? (
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            El tiempo de reserva ha expirado. Debe seleccionar un nuevo horario.
          </span>
        ) : (
          <span
            className={`text-sm font-medium ${isUrgent ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}
          >
            Tiempo restante para confirmar:{" "}
            <span className="font-bold tabular-nums">{timerDisplay}</span>
          </span>
        )}
      </div>

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
          onChange={handleReason}
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
          disabled={isSubmitting || isExpired}
          type="button"
          onClick={handleSubmitClick}
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
