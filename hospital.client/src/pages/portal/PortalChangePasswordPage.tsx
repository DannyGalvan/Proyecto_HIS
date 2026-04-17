import { Link } from "react-router";

import { ChangePasswordForm } from "../../components/form/ChangePasswordForm";
import { nameRoutes } from "../../configs/constants";

export function PortalChangePasswordPage() {
  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-md">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to={nameRoutes.portalProfile}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <i className="bi bi-arrow-left" />
            Volver a Mi Perfil
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <i className="bi bi-shield-lock text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Cambiar Contraseña
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ingrese su contraseña actual y la nueva contraseña
              </p>
            </div>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </section>
  );
}
