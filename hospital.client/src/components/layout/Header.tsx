import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface HeaderProps {
  readonly toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { name } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

      <div className="flex items-center gap-4">
        {/* User name */}
        {name && (
          <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <i className="bi bi-person-circle text-blue-600" />
            {name}
          </span>
        )}

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
