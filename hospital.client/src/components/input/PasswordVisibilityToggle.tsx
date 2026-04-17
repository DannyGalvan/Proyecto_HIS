import { FieldError, Input, Label, TextField } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PasswordVisibilityToggleProps {
  readonly value: string;
  readonly onChange: (val: string) => void;
  readonly name: string;
  readonly label: string;
  readonly isInvalid?: boolean;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  readonly isRequired?: boolean;
}

const AUTO_REVERT_MS = 10_000;

export function PasswordVisibilityToggle({
  value,
  onChange,
  name,
  label,
  isInvalid,
  errorMessage,
  placeholder,
  isRequired,
}: PasswordVisibilityToggleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, AUTO_REVERT_MS);
  }, [clearTimer]);

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => {
      const next = !prev;
      if (next) {
        startTimer();
      } else {
        clearTimer();
      }
      return next;
    });
  }, [startTimer, clearTimer]);

  // Reset timer on value change while visible
  useEffect(() => {
    if (isVisible) {
      startTimer();
    }
  }, [value, isVisible, startTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return (
    <TextField
      className="w-full flex flex-col gap-1"
      isInvalid={!!isInvalid}
      isRequired={isRequired}
      name={name}
      onChange={onChange}
    >
      <Label className="font-bold">{label}</Label>
      <div className="relative w-full">
        <Input
          className="w-full px-3 py-2 border rounded-md pr-10"
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          value={value}
          variant="primary"
        />
        <button
          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          tabIndex={-1}
          type="button"
          onClick={toggleVisibility}
        >
          <i className={`bi ${isVisible ? "bi-eye-slash" : "bi-eye"} text-lg`} />
        </button>
      </div>
      {isInvalid && errorMessage ? (
        <FieldError>{errorMessage}</FieldError>
      ) : null}
    </TextField>
  );
}
