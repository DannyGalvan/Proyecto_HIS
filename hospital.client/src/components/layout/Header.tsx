import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getTimezones } from "../../services/timezoneService";
import { api } from "../../configs/axios/interceptors";
import { useAuthStore } from "../../stores/useAuthStore";
import type { TimezoneResponse } from "../../types/TimezoneResponse";
import type { ApiResponse } from "../../types/ApiResponse";
import { getAppTimezone } from "../../utils/dateFormatter";

interface HeaderProps {
  readonly toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { name } = useAuth();
  const signIn = useAuthStore((s) => s.signIn);
  const authState = useAuthStore((s) => s.authState);
  const [mounted, setMounted] = useState(false);

  // Timezone dropdown state
  const [tzOpen, setTzOpen] = useState(false);
  const [timezones, setTimezones] = useState<TimezoneResponse[]>([]);
  const [tzLoading, setTzLoading] = useState(false);
  const [tzLoaded, setTzLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTz = getAppTimezone();
  // Show short label like "UTC-6" from the IANA id
  const tzShort = currentTz.split("/").pop()?.replace(/_/g, " ") ?? currentTz;

  useEffect(() => { setMounted(true); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!tzOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTzOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [tzOpen]);

  // Load timezones on first open
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
        signIn({ ...authState, timezoneIanaId: tz.ianaId });
        window.location.reload();
      }
    } catch { /* silent */ }
  }, [signIn, authState]);

  const handleThemeChange = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [setTheme, resolvedTheme]);

  return (
    <header className="relative sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(24,24,27,0.85)] px-4 backdrop-blur-md transition-colors duration-300">
      <Button
        aria-label="Toggle Sidebar"
        className="flex min-w-0 bg-transparent items-center justify-center rounded-md p-2 text-gray-600 hover:bg-[var(--color-surface-100)] dark:text-gray-300 transition-colors"
        onClick={toggleSidebar}
      >
        <i className="bi bi-list text-2xl" />
      </Button>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Timezone selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-[var(--color-surface-100)] transition-colors"
            onClick={handleTzToggle}
            title={`Zona horaria: ${currentTz}`}
          >
            <i className="bi bi-globe text-sm text-blue-500" />
            <span className="hidden sm:inline max-w-[100px] truncate">{tzShort}</span>
            <i className={`bi bi-chevron-${tzOpen ? "up" : "down"} text-[10px]`} />
          </button>

          {tzOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 max-h-80 overflow-auto bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-50">
              <div className="p-2 border-b border-gray-100 dark:border-zinc-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">Zona Horaria</p>
              </div>
              {tzLoading ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  <i className="bi bi-hourglass-split animate-spin mr-1" />Cargando...
                </div>
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
                      <span className="block truncate">{tz.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User name */}
        {name && (
          <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <i className="bi bi-person-circle text-blue-600" />
            <span className="max-w-[140px] truncate">{name}</span>
          </span>
        )}

        {/* Theme toggle */}
        {mounted ? (
          <Button
            aria-label="Alternar tema"
            className="theme-toggle-btn flex h-10 w-10 min-w-0 items-center justify-center rounded-full bg-[var(--color-surface-100)] text-[var(--color-primary)] transition-colors"
            onClick={handleThemeChange}
          >
            {resolvedTheme === "dark" ? (
              <i className="bi bi-sun-fill text-lg" />
            ) : (
              <i className="bi bi-moon-stars-fill text-lg" />
            )}
          </Button>
        ) : null}
      </div>
      <div className="header-accent-line" />
    </header>
  );
}
