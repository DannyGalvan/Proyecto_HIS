import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { nameRoutes } from "../../configs/constants";
import { verifyDpi } from "../../services/patientPortalService";
import { isCuiValid } from "../../utils/cuiValidator";

// ── Modal de verificación de DPI ─────────────────────────────────────────────
export function DpiVerificationModal({
  isOpen,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const [dpi, setDpi] = useState("");
  const [dpiError, setDpiError] = useState("");
  const [internalUserMsg, setInternalUserMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setDpiError("");
      setInternalUserMsg("");

      if (!dpi.trim()) {
        setDpiError(
          "El campo DPI es obligatorio. Por favor, ingrese su número de DPI.",
        );
        return;
      }
      if (!/^\d{13}$/.test(dpi.trim())) {
        setDpiError(
          `El DPI debe contener exactamente 13 dígitos. Usted ingresó ${dpi.trim().length} dígitos.`,
        );
        return;
      }
      if (!isCuiValid(dpi.trim())) {
        setDpiError(
          "El número de DPI/CUI no es válido. Verifique que los dígitos sean correctos.",
        );
        return;
      }

      setIsVerifying(true);
      try {
        const response = await verifyDpi(dpi.trim());
        if (response.success) {
          const { exists, hasPatientRole } = response.data;
          if (exists && hasPatientRole) {
            onClose();
            navigate(nameRoutes.portalLogin);
          } else if (!exists) {
            setDpiError(
              "No se encontró un registro asociado a este DPI. Será redirigido al formulario de registro.",
            );
            setTimeout(() => {
              onClose();
              navigate(nameRoutes.portalRegister);
            }, 5000);
          } else {
            // exists=true but hasPatientRole=false → internal user
            setInternalUserMsg(
              "Este DPI pertenece a un usuario del sistema interno. Por favor, contacte a recepción.",
            );
          }
        } else {
          setDpiError(
            response.message ?? "Error al verificar el DPI. Intente de nuevo.",
          );
        }
      } catch {
        setDpiError(
          "No se pudo conectar con el servidor. Intente de nuevo más tarde.",
        );
      } finally {
        setIsVerifying(false);
      }
    },
    [dpi, navigate, onClose],
  );

  const handleDpiChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDpi(e.target.value.replace(/\D/g, ""));
      setDpiError("");
      setInternalUserMsg("");
    },
    [],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            <i className="bi bi-person-badge mr-2 text-blue-600" />
            Verificar Registro
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            onClick={onClose}
          >
            <i className="bi bi-x-lg text-xl" />
          </button>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Ingrese su número de DPI para verificar si está registrado en el
          sistema.
        </p>

        {internalUserMsg ? (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-sm flex items-start gap-2">
            <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
            <span>{internalUserMsg}</span>
          </div>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              Número de DPI *
            </label>
            <input
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest ${
                dpiError
                  ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              }`}
              maxLength={13}
              placeholder="0000000000000"
              type="text"
              value={dpi}
              onChange={handleDpiChange}
            />
            {dpiError ? (
              <p className="text-red-500 text-sm mt-1">
                <i className="bi bi-exclamation-circle mr-1" />
                {dpiError}
              </p>
            ) : null}
            <p className="text-xs text-gray-400 mt-1">
              {dpi.length}/13 dígitos
            </p>
          </div>

          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={isVerifying}
            type="submit"
          >
            {isVerifying ? (
              <>
                <i className="bi bi-hourglass-split animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <i className="bi bi-search" />
                Verificar DPI
              </>
            )}
          </button>

          <button
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
