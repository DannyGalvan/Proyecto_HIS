// ── Reusable field component ──────────────────────────────────────────────────
interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly type?: string;
  readonly placeholder?: string;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly value: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly className?: string;
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Field({
  id,
  label,
  required = false,
  type = "text",
  placeholder,
  maxLength,
  minLength,
  value,
  error,
  disabled,
  readOnly,
  className = "flex flex-col gap-1",
  onChange,
}: FieldProps) {
  return (
    <div className={className}>
      <label
        className="text-sm font-bold text-gray-700 dark:text-gray-300"
        htmlFor={id}
      >
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
          readOnly
            ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
            : error
              ? "border-red-400 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600"
        }`}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        placeholder={placeholder}
        readOnly={readOnly}
        type={type}
        value={value}
        onChange={onChange}
      />
      {error ? (
        <p className="text-red-500 text-xs mt-0.5">
          <i className="bi bi-exclamation-circle mr-1" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
