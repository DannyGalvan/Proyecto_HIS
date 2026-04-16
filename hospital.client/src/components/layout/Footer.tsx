import { Link } from "react-router";
import { nameRoutes } from "../../configs/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex w-full flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(24,24,27,0.9)] backdrop-blur-md px-6 py-4 text-sm text-[var(--color-text-secondary)] transition-colors sm:flex-row shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)] relative z-10">
      <div className="flex flex-col sm:flex-row items-center gap-1">
        <span className="font-semibold text-gray-900 dark:text-white">
          <Link
            className="hover:text-[var(--color-primary)] transition-colors"
            to={nameRoutes.root}
          >
            HIS &copy; {currentYear}
          </Link>
        </span>
        <span className="hidden sm:inline-block">.</span>
        <span>Todos los derechos reservados.</span>
      </div>

      <div className="flex items-center gap-2 font-medium text-xs">
        <span className="version-badge">
          Versión{" "}
          <span className="font-bold text-[var(--color-text-primary)]">
            1.0.0
          </span>
        </span>
      </div>
    </footer>
  );
}
