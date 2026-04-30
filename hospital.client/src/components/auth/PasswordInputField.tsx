import { useCallback } from "react";

interface PasswordInputFieldProps {
  readonly id: string;
  readonly value: string;
  readonly showPassword: boolean;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onToggle: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function PasswordInputField({
  id,
  value,
  showPassword,
  onChange,
  onToggle,
  disabled = false,
  className = "w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors",
}: PasswordInputFieldProps) {
  const handleToggle = useCallback(() => onToggle(), [onToggle]);

  return (
    <div className="relative">
      <input
        autoComplete="current-password"
        className={className}
        disabled={disabled}
        id={id}
        placeholder="Ingrese su contraseña"
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
      />
      <button
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        tabIndex={-1}
        type="button"
        onClick={handleToggle}
      >
        <i
          className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-lg`}
        />
      </button>
    </div>
  );
}
