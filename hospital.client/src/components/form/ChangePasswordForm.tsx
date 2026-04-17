import { Form } from "@heroui/react";
import { useCallback, useState } from "react";

import { manualChangePassword } from "../../services/authService";
import type { ManualChangePasswordRequest } from "../../types/ManualChangePasswordRequest";
import { AsyncButton } from "../button/AsyncButton";
import { PasswordVisibilityToggle } from "../input/PasswordVisibilityToggle";
import { Response } from "../messages/Response";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const initialForm: ChangePasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validate(form: ChangePasswordFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.currentPassword) {
    errors.currentPassword = "La contraseña actual es requerida";
  }

  if (!form.newPassword) {
    errors.newPassword = "La nueva contraseña es requerida";
  } else if (form.newPassword.length < 12) {
    errors.newPassword = "La nueva contraseña debe tener al menos 12 caracteres";
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = "La nueva contraseña debe ser diferente a la actual";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "La confirmación de contraseña es requerida";
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
}

interface ChangePasswordFormProps {
  /** Called after a successful password change so the parent can close the modal, etc. */
  readonly onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [form, setForm] = useState<ChangePasswordFormData>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const handleChange = useCallback(
    (name: keyof ChangePasswordFormData) => (val: string) => {
      setForm((prev) => {
        const next = { ...prev, [name]: val };
        // Clear field error on change
        setFieldErrors((errs) => ({ ...errs, [name]: undefined }));
        return next;
      });
      setSuccess(null);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setSuccess(null);
      setMessage("");

      const errors = validate(form);
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      setLoading(true);

      try {
        const payload: ManualChangePasswordRequest = {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        };

        const response = await manualChangePassword(payload);

        if (response.success) {
          setSuccess(true);
          setMessage("Contraseña actualizada correctamente");
          setForm(initialForm);
          onSuccess?.();
        } else {
          setSuccess(false);
          setMessage(response.message ?? "Error al cambiar la contraseña");

          // Map backend validation failures to field errors if present
          if (Array.isArray(response.data)) {
            const backendErrors: FieldErrors = {};
            for (const failure of (response.data as Array<{ propertyName: string; errorMessage: string }>)) {
              const key = toCamelCase(
                (failure as { propertyName: string }).propertyName,
              ) as keyof FieldErrors;
              if (key in initialForm) {
                backendErrors[key] = (failure as { errorMessage: string }).errorMessage;
              }
            }
            if (Object.keys(backendErrors).length > 0) {
              setFieldErrors(backendErrors);
            }
          }
        }
      } catch {
        setSuccess(false);
        setMessage("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    },
    [form, onSuccess],
  );

  return (
    <div className="flex flex-col gap-4">
      {success != null && <Response message={message} type={success} />}

      <Form
        className="flex flex-col gap-4"
        validationErrors={fieldErrors as Record<string, string>}
        onSubmit={handleSubmit}
      >
        <PasswordVisibilityToggle
          isRequired
          errorMessage={fieldErrors.currentPassword}
          isInvalid={!!fieldErrors.currentPassword}
          label="Contraseña Actual"
          name="currentPassword"
          placeholder="Ingrese su contraseña actual"
          value={form.currentPassword}
          onChange={handleChange("currentPassword")}
        />

        <PasswordVisibilityToggle
          isRequired
          errorMessage={fieldErrors.newPassword}
          isInvalid={!!fieldErrors.newPassword}
          label="Nueva Contraseña"
          name="newPassword"
          placeholder="Mínimo 12 caracteres"
          value={form.newPassword}
          onChange={handleChange("newPassword")}
        />

        <PasswordVisibilityToggle
          isRequired
          errorMessage={fieldErrors.confirmPassword}
          isInvalid={!!fieldErrors.confirmPassword}
          label="Confirmar Nueva Contraseña"
          name="confirmPassword"
          placeholder="Repita la nueva contraseña"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
        />

        <AsyncButton
          className="py-3 mt-2 font-bold w-full"
          isLoading={loading}
          loadingText="Cambiando contraseña..."
          size="lg"
          type="submit"
          variant="primary"
        >
          Cambiar Contraseña
        </AsyncButton>
      </Form>
    </div>
  );
}

/** Convert PascalCase / snake_case property name to camelCase */
function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
