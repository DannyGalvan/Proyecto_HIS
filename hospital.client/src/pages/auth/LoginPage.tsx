import { useState, useCallback, type FormEvent } from "react";
import { Link } from "react-router";

import { LogoHIS } from "../../components/brand/LogoHIS";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import ProtectedLogin from "../../routes/middlewares/ProtectedLogin";
import { authenticateUser } from "../../services/authService";
import { getRoleFromToken } from "../../utils/jwt";

export function Component() {
  const { signIn } = useAuth();

  const [form, setForm] = useState({ userName: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!form.userName || !form.password) {
        setApiError("Ingrese usuario y contraseña.");
        return;
      }

      setIsLoading(true);
      setApiError("");

      try {
        const response = await authenticateUser(form);

        if (!response.success) {
          setApiError("Usuario o contraseña incorrectos.");
          return;
        }

        const auth = response.data;

        // Block patients from admin panel
        const roleName = getRoleFromToken(auth.token);
        if (roleName === "Paciente") {
          setApiError("Este acceso es exclusivo para personal del hospital. Si es paciente, use el portal de pacientes.");
          return;
        }

        signIn({
          email: auth.email,
          token: auth.token,
          userName: auth.userName,
          name: auth.name,
          operations: auth.operations,
          redirect: false,
          isLoggedIn: true,
          userId: auth.userId,
          timezoneIanaId: auth.timezoneIanaId || "America/Guatemala",
        });
      } catch {
        setApiError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [form, signIn],
  );

  return (
    <ProtectedLogin>
      <section className="relative flex items-center justify-center min-h-screen px-4 py-12 login-bg overflow-hidden">
        {/* Decorative medical cross pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='15' y='5' width='10' height='30' rx='2' fill='%230A4FA6'/%3E%3Crect x='5' y='15' width='30' height='10' rx='2' fill='%230A4FA6'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0px_20px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <LogoHIS className="h-14 w-auto" height="auto" width="160px" />
            </div>

            {/* Admin badge */}
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <i className="bi bi-shield-lock" />
                Panel Administrativo
              </span>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Acceso exclusivo para personal del hospital
            </p>

            {apiError && (
              <div className="mb-4 p-4 rounded-xl text-sm flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
                <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label htmlFor="admin-username" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Nombre de usuario *
                </label>
                <input
                  id="admin-username"
                  autoComplete="username"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Ingrese su usuario"
                  type="text"
                  value={form.userName}
                  onChange={(e) => { setForm((prev) => ({ ...prev, userName: e.target.value })); setApiError(""); }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="admin-password" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Ingrese su contraseña"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => { setForm((prev) => ({ ...prev, password: e.target.value })); setApiError(""); }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-lg`} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
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
              <Link
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
                to={nameRoutes.forgotPassword}
              >
                ¿Olvidó su contraseña?
              </Link>
              <Link
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs mt-2"
                to={nameRoutes.portalLogin}
              >
                <i className="bi bi-person mr-1" />
                Acceso Portal de Pacientes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </ProtectedLogin>
  );
}

Component.displayName = "LoginPage";
