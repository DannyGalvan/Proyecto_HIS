import { useState, useCallback, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { Images } from "../../assets/images/images";
import { nameRoutes } from "../../configs/constants";
import { loginPatient } from "../../services/patientPortalService";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

// ── Zod schema ────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  userName: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ── JWT decoder ───────────────────────────────────────────────────────────────
const decodeJwt = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// ── Page ──────────────────────────────────────────────────────────────────────
export function PortalLoginPage() {
  const navigate = useNavigate();
  const { signInPatient } = usePatientAuthStore();

  const [form, setForm] = useState<LoginForm>({ userName: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const isLocked = lockedUntil !== null && new Date() < lockedUntil;

  const handleChange = useCallback(
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      setApiError("");
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (isLocked) return;

      // Client-side validation
      const result = loginSchema.safeParse(form);
      if (!result.success) {
        const errs: Partial<Record<keyof LoginForm, string>> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof LoginForm;
          errs[key] = issue.message;
        }
        setFieldErrors(errs);
        return;
      }

      setIsLoading(true);
      setApiError("");

      try {
        const response = await loginPatient({ userName: form.userName, password: form.password });

        if (response.success) {
          const { token } = response.data;
          const payload = decodeJwt(token);

          const userId =
            (payload?.[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] as string | undefined) ??
            (payload?.sub as string | undefined) ??
            "0";

          const name =
            (payload?.[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] as string | undefined) ?? "";

          const email =
            (payload?.[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            ] as string | undefined) ?? "";

          signInPatient({
            isLoggedIn: true,
            token,
            userId: Number(userId),
            name,
            email,
            userName: form.userName,
          });

          navigate(nameRoutes.portalDashboard);
        } else {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);

          if (newAttempts >= MAX_ATTEMPTS) {
            const lockout = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
            setLockedUntil(lockout);
            setApiError(
              `Cuenta bloqueada temporalmente. Intente de nuevo en ${LOCKOUT_MINUTES} minutos.`,
            );
          } else {
            setApiError("Usuario o contraseña incorrectos.");
          }
        }
      } catch {
        setApiError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [form, isLocked, failedAttempts, signInPatient, navigate],
  );

  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img alt="Hospital HIS" src={Images.logo} className="h-14 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Acceda a su cuenta del portal de pacientes
          </p>

          {/* Error banner */}
          {apiError && (
            <div
              className={`mb-4 p-4 rounded-xl text-sm flex items-start gap-2 ${
                isLocked
                  ? "bg-red-50 border border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
                  : "bg-amber-50 border border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300"
              }`}
            >
              <i
                className={`bi ${isLocked ? "bi-lock-fill" : "bi-exclamation-triangle-fill"} mt-0.5 shrink-0`}
              />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="portal-username"
                className="text-sm font-bold text-gray-700 dark:text-gray-300"
              >
                Nombre de usuario *
              </label>
              <input
                id="portal-username"
                autoComplete="username"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                  fieldErrors.userName
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                disabled={isLocked}
                placeholder="Ingrese su usuario"
                type="text"
                value={form.userName}
                onChange={handleChange("userName")}
              />
              {fieldErrors.userName && (
                <p className="text-red-500 text-xs mt-0.5">
                  <i className="bi bi-exclamation-circle mr-1" />
                  {fieldErrors.userName}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="portal-password"
                className="text-sm font-bold text-gray-700 dark:text-gray-300"
              >
                Contraseña *
              </label>
              <input
                id="portal-password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                  fieldErrors.password
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                disabled={isLocked}
                placeholder="Ingrese su contraseña"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-0.5">
                  <i className="bi bi-exclamation-circle mr-1" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              disabled={isLoading || isLocked}
              type="submit"
            >
              {isLoading ? (
                <>
                  <i className="bi bi-hourglass-split animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col items-center mt-6 gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">¿No tiene cuenta?</span>
            <Link
              className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
              to={nameRoutes.portalRegister}
            >
              <i className="bi bi-person-plus mr-1" />
              Registrarse como paciente
            </Link>
            <Link
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs mt-1"
              to={nameRoutes.portalHome}
            >
              <i className="bi bi-arrow-left mr-1" />
              Volver al portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PortalLoginPage;

export function Component() {
  return <PortalLoginPage />;
}
Component.displayName = "PortalLoginPage";
