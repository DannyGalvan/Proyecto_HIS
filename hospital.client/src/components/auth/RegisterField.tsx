import { FieldError, Input, Label, TextField } from "@heroui/react";

interface RegisterFieldProps {
  readonly name: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly isRequired?: boolean;
  readonly isInvalid?: boolean;
  readonly error?: string;
  readonly type?: string;
  readonly placeholder?: string;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly className?: string;
}

export function RegisterField({
  name,
  label,
  value,
  onChange,
  isRequired = false,
  isInvalid = false,
  error,
  type = "text",
  placeholder,
  maxLength,
  minLength,
  className = "flex flex-col gap-1",
}: RegisterFieldProps) {
  return (
    <TextField
      className={className}
      isInvalid={isInvalid}
      isRequired={isRequired}
      name={name}
      onChange={onChange}
    >
      <Label className="font-bold">{label}</Label>
      <Input
        className="px-3 py-2 border rounded-md"
        maxLength={maxLength}
        minLength={minLength}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
