import { Link, Outlet, useNavigate } from "react-router";

import { LogoHIS } from "../components/brand/LogoHIS";
import { nameRoutes } from "../configs/constants";
import { usePatientAuthStore } from "../stores/usePatientAuthStore";

export function PortalLayout() {
  const navigate = useNavigate();
  const { isLoggedIn, name, logoutPatient } = usePatientAuthStore();

  const handleLogout = () => {
    logoutPatient();
    navigate(nameRoutes.portalHome);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo + nombre */}
          <Link
            to={nameRoutes.portalHome}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <LogoHIS width="120px" height="auto" />
            <span className="font-bold text-gray-800 dark:text-gray-100 text-lg hidden sm:block">
              Hospital HIS
            </span>
          </Link>

          {/* Links de navegación */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link
              to={nameRoutes.portalHome}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Inicio
            </Link>
            <a
              href="#servicios"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Especialidades
            </a>
            {isLoggedIn && (
              <Link
                to={nameRoutes.portalAppointments}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Mis Citas
              </Link>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Nombre del paciente */}
                <button
                  type="button"
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => navigate(nameRoutes.portalDashboard)}
                >
                  <i className="bi bi-person-circle text-blue-600" />
                  {name || "Mi cuenta"}
                </button>
                {/* Agendar cita */}
                <button
                  type="button"
                  className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => navigate(nameRoutes.portalBook)}
                >
                  <i className="bi bi-calendar-plus mr-1" />
                  Agendar Cita
                </button>
                {/* Cerrar sesión */}
                <button
                  type="button"
                  className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right mr-1" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => navigate(nameRoutes.portalLogin)}
                >
                  <i className="bi bi-box-arrow-in-right mr-1" />
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => navigate(nameRoutes.portalRegister)}
                >
                  <i className="bi bi-person-plus mr-1" />
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Identidad */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <i className="bi bi-hospital text-blue-400 text-xl" />
              <span className="font-bold text-white text-lg">Hospital HIS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Sistema Informático Hospitalario. Atención médica de calidad al alcance de todos.
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div>
            <h3 className="font-bold text-white mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <i className="bi bi-telephone text-blue-400" />
                <span>+502 2222-3333</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="bi bi-envelope text-blue-400" />
                <span>info@hospitalhis.gt</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="bi bi-geo-alt text-blue-400" />
                <span>Ciudad de Guatemala, Guatemala</span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Horarios */}
          <div>
            <h3 className="font-bold text-white mb-3">Horarios de Atención</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <i className="bi bi-clock text-blue-400" />
                <span>Lunes – Viernes: 7:00 AM – 7:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="bi bi-clock text-blue-400" />
                <span>Sábados: 8:00 AM – 2:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="bi bi-alarm text-red-400" />
                <span>Emergencias: 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-xs">
          <p>
            © {new Date().getFullYear()} Hospital HIS — Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PortalLayout;
