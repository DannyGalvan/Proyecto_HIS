import { useState, useCallback, useEffect, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";

import { nameRoutes } from "../../configs/constants";
import { validateRecoveryToken, resetPasswordWithToken } from "../../services/authService";
import { PasswordVisibilityToggle } from "../../components/input/PasswordVisibilityToggle";

const passwordSchema = z.object({
  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres"),
  confirmPassword: z.string().min(1, "La confirmación es requerida"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetState = "validating" | "valid" | "expired" | "success" | "error";

interface ResetPasswordPageProps {
  /** Where to link "back to login" */
  readonly loginRoute?: string;
  /** Where to link "request new token" */
  readonly forgotRoute?: string;
}

export function ResetPasswordPage({
  loginRoute = nameRoutes.login,
  forgotRoute = nameRoutes.forgotPassword,
}: ResetPasswordPageProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<ResetState>("validating");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setState("expired");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await validateRecoveryToken(token);
        if (!cancelled) {
          setState(response.success ? "valid" : "expired");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setApiError("");
      setFieldErrors({});

      const result = passwordSchema.safeParse({ password, confirmPassword });
      if (!result.success) {
        const errs: typeof fieldErrors = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof typeof fieldErrors;
          if (!errs[key]) errs[key] = issue.message;
        }
        setFieldErrors(errs);
        return;
      }

      setIsLoading(true);
      try {
        const response = await resetPasswordWithToken({
          token,
          password,
          confirmPassword,
        });

        if (response.success) {
          setState("success");
        } else {
          setApiError(response.message ?? "Error al cambiar la contraseña.");
        }
      } catch {
        setApiError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, password, confirmPassword],
  );

  return (
    <section className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">

          {/* Validating token */}
          {state === "validating" && (
            <div className="text-center py-8">
              <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
              <p className="text-gray-500 dark:text-gray-400 mt-3">Verificando enlace de recuperación...</p>
            </div>
          )}

          {/* Token expired or invalid */}
          {state === "expired" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
                  <i className="bi bi-clock-history text-3xl text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Enlace Expirado
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                El enlace de recuperación ha expirado o no es válido. Los enlaces son válidos por 15 minutos.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to={forgotRoute}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <i className="bi bi-envelope-at" />
                  Solicitar Nuevo Enlace
                </Link>
                <Link
                  to={loginRoute}
                  className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400"
                >
                  <i className="bi bi-arrow-left mr-1" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          )}

          {/* Connection error */}
          {state === "error" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <i className="bi bi-wifi-off text-3xl text-yellow-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Error de Conexión
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                No se pudo verificar el enlace. Intente de nuevo más tarde.
              </p>
              <Link
                to={loginRoute}
                className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400"
              >
                <i className="bi bi-arrow-left mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          )}

          {/* Token valid — show password form */}
          {state === "valid" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <i className="bi bi-shield-lock text-3xl text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">
                Nueva Contraseña
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                Ingrese su nueva contraseña. Debe tener al menos 12 caracteres.
              </p>

              {apiError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl text-red-800 text-sm flex items-start gap-2 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
                  <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <PasswordVisibilityToggle
                  isRequired
                  errorMessage={fieldErrors.password}
                  isInvalid={!!fieldErrors.password}
                  label="Nueva Contraseña"
                  name="password"
                  placeholder="Mínimo 12 caracteres"
                  value={password}
                  onChange={setPassword}
                />

                <PasswordVisibilityToggle
                  isRequired
                  errorMessage={fieldErrors.confirmPassword}
                  isInvalid={!!fieldErrors.confirmPassword}
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  placeholder="Repita la nueva contraseña"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />

                <button
                  className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <i className="bi bi-hourglass-split animate-spin" />
                      Cambiando contraseña...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" />
                      Cambiar Contraseña
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                  <i className="bi bi-check-circle text-3xl text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Contraseña Actualizada
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Su contraseña ha sido cambiada exitosamente. Ya puede iniciar sesión con su nueva contraseña.
              </p>
              <Link
                to={loginRoute}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 inline-flex"
              >
                <i className="bi bi-box-arrow-in-right" />
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Admin reset password wrapper */
export function AdminResetPasswordPage() {
  return <ResetPasswordPage loginRoute={nameRoutes.login} forgotRoute={nameRoutes.forgotPassword} />;
}

/** Portal reset password wrapper */
export function PortalResetPasswordPage() {
  return <ResetPasswordPage loginRoute={nameRoutes.portalLogin} forgotRoute={nameRoutes.portalForgotPassword} />;
}

export default ResetPasswordPage;
