interface DetailRowProps {
  readonly label: string;
  readonly value: string;
  readonly icon?: string;
}

export function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {icon ? <i className={`bi ${icon} mr-1`} /> : null}
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
        {value || "—"}
      </span>
    </div>
  );
}
