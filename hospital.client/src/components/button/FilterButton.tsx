export function FilterButton({
  active,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active
          ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
