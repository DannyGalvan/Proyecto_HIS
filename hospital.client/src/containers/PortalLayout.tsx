import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";

import { LogoHIS } from "../components/brand/LogoHIS";
import { api } from "../configs/axios/interceptors";
import { nameRoutes } from "../configs/constants";
import { getTimezones } from "../services/timezoneService";
import { usePatientAuthStore } from "../stores/usePatientAuthStore";
import type { ApiResponse } from "../types/ApiResponse";
import type { TimezoneResponse } from "../types/TimezoneResponse";
import { getAppTimezone } from "../utils/dateFormatter";

export function PortalLayout() {
  const navigate = useNavigate();
  const { isLoggedIn, name, loading, logoutPatient, syncPatientAuth, signInPatient, ...patientState } = usePatientAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Timezone dropdown state
  const [tzOpen, setTzOpen] = useState(false);
  const [timezones, setTimezones] = useState<TimezoneResponse[]>([]);
  const [tzLoaded, setTzLoaded] = useState(false);
  const [tzLoading, setTzLoading] = useState(false);
  const tzRef = useRef<HTMLDivElement>(null);
  const currentTz = getAppTimezone();
  const tzShort = currentTz.split("/").pop()?.replace(/_/g, " ") ?? currentTz;

  // Sync patient auth from localStorage on mount (handles page reload)
  useEffect(() => {
    syncPatientAuth();
  }, [syncPatientAuth]);

  // Close tz dropdown on outside click
  useEffect(() => {
    if (!tzOpen) return;
    const handler = (e: MouseEvent) => {
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) setTzOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [tzOpen]);

  const handleTzToggle = useCallback(async () => {
    setTzOpen((prev) => !prev);
    if (!tzLoaded) {
      setTzLoading(true);
      try {
        const res = await getTimezones({ filters: "State:eq:1", include: null, includeTotal: false, pageNumber: 1, pageSize: 100 });
        if (res.success) setTimezones(res.data);
        setTzLoaded(true);
      } catch { /* silent */ }
      finally { setTzLoading(false); }
    }
  }, [tzLoaded]);

  const handleTzSelect = useCallback(async (tz: TimezoneResponse) => {
    setTzOpen(false);
    try {
      const res = await api.patch<unknown, ApiResponse<{ timezoneIanaId: string }>, { timezoneId: number }>(
        "/Auth/Timezone",
        { timezoneId: tz.id },
      );
      if (res.success) {
        signInPatient({ ...patientState, isLoggedIn, name, timezoneIanaId: tz.ianaId });
        window.location.reload();
      }
    } catch { /* silent */ }
  }, [signInPatient, patientState, isLoggedIn]);

  const handleLogout = useCallback(() => {
    logoutPatient();
    setMobileMenuOpen(false);
    navigate(nameRoutes.portalHome);
  }, [logoutPatient, navigate]);

  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);

  const handleNavigate = useCallback(
    (route: string) => {
      setMobileMenuOpen(false);
      navigate(route);
    },
    [navigate],
  );

  // Show loading while syncing auth from localStorage
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ── Navbar ── */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              to={nameRoutes.portalHome}
              className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
              onClick={closeMobile}
            >
              <LogoHIS width="100px" height="auto" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link to={nameRoutes.portalHome} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Inicio
              </Link>
              {isLoggedIn && (
                <>
                  <Link to={nameRoutes.portalDashboard} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Dashboard
                  </Link>
                  <Link to={nameRoutes.portalAppointments} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Mis Citas
                  </Link>
                  <Link to={nameRoutes.portalProfile} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Mi Perfil
                  </Link>
                </>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  {/* Timezone selector */}
                  <div className="relative" ref={tzRef}>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={handleTzToggle}
                      title={`Zona horaria: ${currentTz}`}
                    >
                      <i className="bi bi-globe text-sm text-blue-500" />
                      <span className="max-w-[90px] truncate">{tzShort}</span>
                      <i className={`bi bi-chevron-${tzOpen ? "up" : "down"} text-[10px]`} />
                    </button>
                    {tzOpen && (
                      <div className="absolute right-0 top-full mt-1 w-72 max-h-80 overflow-auto bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-50">
                        <div className="p-2 border-b border-gray-100 dark:border-zinc-700">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">Zona Horaria</p>
                        </div>
                        {tzLoading ? (
                          <div className="p-4 text-center text-sm text-gray-400">Cargando...</div>
                        ) : (
                          <div className="py-1">
                            {timezones.map((tz) => (
                              <button
                                key={tz.id}
                                type="button"
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                  tz.ianaId === currentTz
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                }`}
                                onClick={() => handleTzSelect(tz)}
                              >
                                {tz.displayName}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors max-w-[180px] truncate"
                    onClick={() => navigate(nameRoutes.portalDashboard)}
                  >
                    <i className="bi bi-person-circle text-blue-600 shrink-0" />
                    <span className="truncate">{name || "Mi cuenta"}</span>
                  </button>
                  <button
                    type="button"
                    className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    onClick={() => navigate(nameRoutes.portalBook)}
                  >
                    <i className="bi bi-calendar-plus mr-1" />
                    Agendar Cita
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right mr-1" />
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => navigate(nameRoutes.portalLogin)}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    onClick={() => navigate(nameRoutes.portalRegister)}
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>

            {/* Mobile: CTA + hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              {isLoggedIn && (
                <button
                  type="button"
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  onClick={() => handleNavigate(nameRoutes.portalBook)}
                >
                  <i className="bi bi-calendar-plus mr-1" />
                  Agendar
                </button>
              )}
              <button
                type="button"
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                <i className={`bi ${mobileMenuOpen ? "bi-x-lg" : "bi-list"} text-xl`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-3 space-y-1">
              {/* User info */}
              {isLoggedIn && name && (
                <div className="px-3 py-2 mb-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Sesión activa</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{name}</p>
                </div>
              )}

              {/* Nav links */}
              <Link
                to={nameRoutes.portalHome}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={closeMobile}
              >
                <i className="bi bi-house text-gray-400 w-5 text-center" />
                Inicio
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    to={nameRoutes.portalDashboard}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={closeMobile}
                  >
                    <i className="bi bi-speedometer2 text-gray-400 w-5 text-center" />
                    Dashboard
                  </Link>
                  <Link
                    to={nameRoutes.portalAppointments}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={closeMobile}
                  >
                    <i className="bi bi-calendar-check text-gray-400 w-5 text-center" />
                    Mis Citas
                  </Link>
                  <Link
                    to={nameRoutes.portalProfile}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={closeMobile}
                  >
                    <i className="bi bi-person text-gray-400 w-5 text-center" />
                    Mi Perfil
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full"
                    onClick={() => handleNavigate(nameRoutes.portalBook)}
                  >
                    <i className="bi bi-calendar-plus text-gray-400 w-5 text-center" />
                    Agendar Cita
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                  <button
                    type="button"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right w-5 text-center" />
                    Cerrar Sesión
                  </button>
                </>
              )}

              {!isLoggedIn && (
                <>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full"
                    onClick={() => handleNavigate(nameRoutes.portalLogin)}
                  >
                    <i className="bi bi-box-arrow-in-right text-gray-400 w-5 text-center" />
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-full"
                    onClick={() => handleNavigate(nameRoutes.portalRegister)}
                  >
                    <i className="bi bi-person-plus text-blue-500 w-5 text-center" />
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <i className="bi bi-hospital text-blue-400 text-xl" />
              <span className="font-bold text-white text-lg">Hospital HIS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Sistema Informático Hospitalario. Atención médica de calidad al alcance de todos.
            </p>
          </div>
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
          <p>© {new Date().getFullYear()} Hospital HIS — Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default PortalLayout;
