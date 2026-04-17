import { useNavigate } from "react-router";
import { nameRoutes } from "../../configs/constants";

interface BlockedWithoutContextProps {
  readonly title: string;
  readonly message: string;
  readonly backRoute?: string;
  readonly backLabel?: string;
  readonly icon?: string;
}

/**
 * Shown when a clinical page is accessed without the required appointment context.
 * Prevents creating records with arbitrary IDs entered manually.
 */
export function BlockedWithoutContext({
  title,
  message,
  backRoute,
  backLabel = "Ir al Panel",
  icon = "bi-shield-exclamation",
}: BlockedWithoutContextProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <i className={`bi ${icon} text-6xl text-red-400`} />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">{message}</p>
      <button
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
        type="button"
        onClick={() => navigate(backRoute ?? nameRoutes.doctorDashboard)}
      >
        <i className="bi bi-arrow-left" />
        {backLabel}
      </button>
    </div>
  );
}
