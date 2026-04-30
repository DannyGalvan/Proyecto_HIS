import { useCallback } from "react";
import { useNavigate } from "react-router";

interface QuickActionButtonProps {
  readonly icon: string;
  readonly label: string;
  readonly to: string;
}

export function QuickActionButton({ icon, label, to }: QuickActionButtonProps) {
  const navigate = useNavigate();
  const handleClick = useCallback(() => navigate(to), [navigate, to]);

  return (
    <button
      className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900/50 border rounded-xl shadow-sm hover:border-primary/60 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
      type="button"
      onClick={handleClick}
    >
      <i className={`bi ${icon} text-2xl text-primary`} />
      <span className="text-xs font-semibold text-center text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </button>
  );
}
