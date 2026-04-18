/* eslint-disable react/jsx-max-depth */
import { Button, Tooltip } from "@heroui/react";
import { useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogoHIS } from "../brand/LogoHIS";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { SubMenu } from "../links/SubMenu";

interface SidebarProps {
  readonly isOpen: boolean;
  readonly closeSidebar: () => void;
}

export function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, operations } = useAuth();

  const closeSesion = useCallback(() => {
    logout();
    navigate(nameRoutes.login);
  }, [logout, navigate]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  }, [pathname, closeSidebar]);

  return (
    <>
      {/* Overlay para móviles */}
      <div
        className={`fixed inset-0 z-47 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`fixed left-0 top-0 z-48 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-50)] transition-all duration-300 ease-in-out md:sticky whitespace-nowrap ${
          isOpen
            ? "w-[17rem] translate-x-0 shadow-[4px_0_12px_rgba(10,79,166,0.08)] md:shadow-none"
            : "w-18 -translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-[var(--color-border)] relative w-full overflow-hidden">
          <Link
            className="flex items-center justify-center h-full transition-all duration-300 w-full"
            to={nameRoutes.root}
          >
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ${isOpen ? "w-36" : "w-10"}`}
            >
              {isOpen ? (
                <LogoHIS className="rounded-xl" height="auto" width="140px" />
              ) : (
                <LogoHIS height={36} width={36} />
              )}
            </div>
          </Link>
          <Button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white md:hidden min-w-0 p-1 bg-transparent w-auto h-auto"
            onClick={closeSidebar}
          >
            <i className="bi bi-x-lg text-lg" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 pb-20">
          <div className="flex flex-col items-center w-full space-y-1">
            <div className="w-full px-3">
              <Tooltip closeDelay={0} delay={0} isDisabled={isOpen}>
                <Link
                  className={`relative flex items-center rounded-lg py-2.5 text-[0.9rem] font-bold transition-all w-full
                        ${
                          pathname === nameRoutes.root
                            ? "sidebar-link-active"
                            : "text-gray-700 hover:bg-[var(--color-surface-100)] dark:text-gray-300"
                        } 
                        ${isOpen ? "justify-start px-3" : "justify-center px-0"}
                      `}
                  to={nameRoutes.root}
                >
                  <div className="flex items-center justify-center w-6 h-6 shrink-0">
                    <i className="bi bi-house-door-fill text-xl" />
                  </div>
                  <div
                    className={`flex items-center overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100 ml-3" : "w-0 opacity-0"}`}
                  >
                    <span>Inicio</span>
                  </div>
                  {!isOpen && pathname === nameRoutes.root && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    />
                  )}
                </Link>

                <Tooltip.Content
                  className="bg-gray-900 text-white dark:bg-zinc-800 rounded-md px-2 py-1 text-sm"
                  placement="right"
                >
                  <Tooltip.Arrow className="fill-gray-900 dark:fill-zinc-800" />
                  Inicio
                </Tooltip.Content>
              </Tooltip>
            </div>

            {/* Calendar link — visible for doctors */}
            <div className="w-full px-3">
              <Tooltip closeDelay={0} delay={0} isDisabled={isOpen}>
                <Link
                  className={`relative flex items-center rounded-lg py-2.5 text-[0.9rem] font-bold transition-all w-full
                        ${
                          pathname === nameRoutes.doctorCalendar
                            ? "sidebar-link-active"
                            : "text-gray-700 hover:bg-[var(--color-surface-100)] dark:text-gray-300"
                        } 
                        ${isOpen ? "justify-start px-3" : "justify-center px-0"}
                      `}
                  to={nameRoutes.doctorCalendar}
                >
                  <div className="flex items-center justify-center w-6 h-6 shrink-0">
                    <i className="bi bi-calendar3 text-xl" />
                  </div>
                  <div
                    className={`flex items-center overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100 ml-3" : "w-0 opacity-0"}`}
                  >
                    <span>Mi Calendario</span>
                  </div>
                  {!isOpen && pathname === nameRoutes.doctorCalendar && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    />
                  )}
                </Link>
                <Tooltip.Content
                  className="bg-gray-900 text-white dark:bg-zinc-800 rounded-md px-2 py-1 text-sm"
                  placement="right"
                >
                  <Tooltip.Arrow className="fill-gray-900 dark:fill-zinc-800" />
                  Mi Calendario
                </Tooltip.Content>
              </Tooltip>
            </div>

            <div className="sidebar-divider" />

            <div className="w-full space-y-1 px-3">
              {operations
                ?.filter((menu) => menu.module.isVisible)
                .map((menu) => (
                  <div
                    key={menu.module.path}
                    className="w-full sidebar-menu-item"
                  >
                    <SubMenu data={menu} isCollapsed={!isOpen} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] p-4 shrink-0 w-full flex justify-center">
          <div className="w-full">
            <Tooltip closeDelay={0} delay={0} isDisabled={isOpen}>
              <Button
                className={`relative flex items-center rounded-lg py-2 text-[0.9rem] font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent w-full ${isOpen ? "justify-start px-3" : "justify-center px-0!"}`}
                onClick={closeSesion}
              >
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  <i className="bi bi-box-arrow-left text-xl" />
                </div>
                <div
                  className={`flex items-center overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100 ml-3" : "w-0 opacity-0"}`}
                >
                  <span>Salir</span>
                </div>
              </Button>

              <Tooltip.Content
                className="bg-red-600 text-white rounded-md px-2 py-1 text-sm shadow-md"
                placement="right"
              >
                <Tooltip.Arrow className="fill-red-600" />
                Cerrar sesión
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </aside>
    </>
  );
}
