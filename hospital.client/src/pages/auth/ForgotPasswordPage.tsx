import { useState, useCallback, type FormEvent } from "react";
import { Link } from "react-router";
import { z } from "zod";

import { nameRoutes } from "../../configs/constants";
import { recoveryPassword } from "../../services/authService";

const emailSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Ingrese un correo válido"),
});

interface ForgotPasswordPageProps {
  /** Where to link "back to login" — defaults to admin login */
  readonly loginRoute?: string;
}

export function ForgotPasswordPage({ loginRoute = nameRoutes.login }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const response = await recoveryPassword(email.trim());
        if (response.success) {
          setSent(true);
        } else {
          // Always show generic message to prevent email enumeration
          setSent(true);
        }
      } catch {
        setError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [email],
  );

  return (
    <section className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <i className="bi bi-envelope-at text-3xl text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
          </p>

          {sent ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-xl text-green-800 text-sm dark:bg-green-900/20 dark:border-green-700 dark:text-green-300">
                <i className="bi bi-check-circle-fill mr-2" />
                Si el correo está registrado, recibirá un enlace de recuperación. Revise su bandeja de entrada y la carpeta de spam.
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                El enlace es válido por 15 minutos.
              </p>
              <Link
                to={loginRoute}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
              >
                <i className="bi bi-arrow-left mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl text-red-800 text-sm flex items-start gap-2 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
                  <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1">
                  <label htmlFor="recovery-email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Correo Electrónico *
                  </label>
                  <input
                    id="recovery-email"
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="usuario@dominio.com"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                </div>

                <button
                  className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <i className="bi bi-hourglass-split animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send" />
                      Enviar Enlace de Recuperación
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link
                  to={loginRoute}
                  className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <i className="bi bi-arrow-left mr-1" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** Admin forgot password wrapper */
export function AdminForgotPasswordPage() {
  return <ForgotPasswordPage loginRoute={nameRoutes.login} />;
}

/** Portal forgot password wrapper */
export function PortalForgotPasswordPage() {
  return <ForgotPasswordPage loginRoute={nameRoutes.portalLogin} />;
}

export default ForgotPasswordPage;
