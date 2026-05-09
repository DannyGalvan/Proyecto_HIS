import { useCallback, useState } from "react";
import { CONSULTATION_FEE } from "../../configs/constants";
import { formatDateLong, formatTime } from "../../utils/dateFormatter";

export interface SummaryData {
  patientName: string;
  patientId: number;
  branchId: number;
  branchName: string;
  specialtyId: number;
  specialtyName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: Date;
}

interface Step6ConfirmProps {
  readonly summary: SummaryData;
  readonly onBack: () => void;
  readonly onConfirm: (reason: string, priority: number) => Promise<void>;
}

export function Step6Confirm({
  summary,
  onBack,
  onConfirm,
}: Step6ConfirmProps) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
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
      await onConfirm(reason.trim(), isEmergency ? 1 : 0);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Error al confirmar la cita.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [reason, isEmergency, onConfirm]);

  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setReason(e.target.value);
      setReasonError("");
    },
    [],
  );

  const handleConfirmClick = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);

  const formattedDate = formatDateLong(summary.appointmentDate.toISOString());
  const formattedTime = formatTime(summary.appointmentDate.toISOString());

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Confirmar Cita
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Revise los detalles y proporcione el motivo de la consulta.
      </p>

      {/* Summary card */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-3 font-bold text-blue-800 dark:text-blue-300">
          <i className="bi bi-clipboard2-check mr-2" />
          Resumen de la Cita
        </h3>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Paciente</dt>
            <dd className="font-semibold text-gray-800 dark:text-gray-100">
              {summary.patientName}
            </dd>
          </div>
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
            <dt className="text-gray-500 dark:text-gray-400">Médico</dt>
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

      {/* Reason textarea */}
      <div className="mb-6 flex flex-col gap-1">
        <label
          className="text-sm font-bold text-gray-700 dark:text-gray-300"
          htmlFor="reason"
        >
          Motivo de la Consulta *
        </label>
        <textarea
          className={`w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
            reasonError
              ? "border-red-400 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
          id="reason"
          maxLength={2000}
          minLength={10}
          placeholder="Describa brevemente el motivo de la consulta (mínimo 10 caracteres)..."
          rows={4}
          value={reason}
          onChange={handleReasonChange}
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

      {/* Emergency toggle */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <input
          checked={isEmergency}
          className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
          id="emergency"
          type="checkbox"
          onChange={(e) => setIsEmergency(e.target.checked)}
        />
        <label
          className="text-sm font-semibold text-red-700 dark:text-red-300"
          htmlFor="emergency"
        >
          Marcar como emergencia
        </label>
      </div>

      {/* API error */}
      {apiError ? (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          <i className="bi bi-exclamation-triangle-fill mr-2" />
          {apiError}
        </div>
      ) : null}

      {/* Actions */}
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
          onClick={handleConfirmClick}
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
