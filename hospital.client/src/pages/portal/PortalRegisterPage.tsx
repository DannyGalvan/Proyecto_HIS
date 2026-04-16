import { useState, useCallback, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { Images } from "../../assets/images/images";
import { nameRoutes } from "../../configs/constants";
import { registerPatient } from "../../services/patientPortalService";
import type { PatientRegisterRequest } from "../../types/PatientPortalTypes";

// ── Zod schema ────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z
    .string()
    .min(10, "El nombre debe tener al menos 10 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  dpi: z
    .string()
    .regex(/^\d{13}$/, "El DPI debe contener exactamente 13 dígitos numéricos"),
  userName: z
    .string()
    .min(8, "El nombre de usuario debe tener entre 8 y 9 caracteres")
    .max(9, "El nombre de usuario debe tener entre 8 y 9 caracteres"),
  password: z.string().min(12, "La contraseña debe tener al menos 12 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido"),
  number: z
    .string()
    .regex(/^\d{8}$/, "El teléfono debe contener exactamente 8 dígitos numéricos"),
  nit: z
    .string()
    .regex(/^[a-zA-Z0-9]{8,9}$/, "El NIT debe tener entre 8 y 9 caracteres alfanuméricos")
    .optional()
    .or(z.literal("")),
  insuranceNumber: z
    .string()
    .min(5, "El número de seguro debe tener entre 5 y 50 caracteres")
    .max(50, "El número de seguro debe tener entre 5 y 50 caracteres")
    .optional()
    .or(z.literal("")),
});

type RegisterForm = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof RegisterForm, string>>;

const initialForm: RegisterForm = {
  name: "",
  dpi: "",
  userName: "",
  password: "",
  email: "",
  number: "",
  nit: "",
  insuranceNumber: "",
};

// ── Reusable field component ──────────────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Field({
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
  onChange,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
          error
            ? "border-red-400 bg-red-50 dark:bg-red-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
      {error && (
        <p className="text-red-500 text-xs mt-0.5">
          <i className="bi bi-exclamation-circle mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function PortalRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback(
    (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Numeric-only fields
      if (field === "dpi" || field === "number") {
        value = value.replace(/\D/g, "");
      }

      setForm((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      setApiError("");
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Client-side validation
      const result = registerSchema.safeParse(form);
      if (!result.success) {
        const errs: FieldErrors = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof RegisterForm;
          if (!errs[key]) errs[key] = issue.message;
        }
        setFieldErrors(errs);
        return;
      }

      setIsLoading(true);
      setApiError("");

      try {
        const payload: PatientRegisterRequest = {
          name: form.name,
          dpi: form.dpi,
          userName: form.userName,
          password: form.password,
          email: form.email,
          number: form.number,
          nit: form.nit || undefined,
          insuranceNumber: form.insuranceNumber || undefined,
        };

        const response = await registerPatient(payload);

        if (response.success) {
          navigate(nameRoutes.portalLogin, {
            state: { successMessage: "¡Registro exitoso! Ahora puede iniciar sesión." },
          });
        } else {
          setApiError(response.message ?? "Error al registrar. Intente de nuevo.");
        }
      } catch {
        setApiError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [form, navigate],
  );

  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img alt="Hospital HIS" src={Images.logo} className="h-14 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">
            Registro de Paciente
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Complete sus datos para crear su cuenta y agendar citas médicas
          </p>

          {/* Error banner */}
          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl text-red-800 text-sm flex items-start gap-2 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
              <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name — full width */}
              <div className="md:col-span-2">
                <Field
                  required
                  error={fieldErrors.name}
                  id="reg-name"
                  label="Nombre Completo"
                  maxLength={100}
                  minLength={10}
                  placeholder="Mínimo 10 caracteres"
                  value={form.name}
                  onChange={handleChange("name")}
                />
              </div>

              {/* DPI */}
              <Field
                required
                error={fieldErrors.dpi}
                id="reg-dpi"
                label="DPI (13 dígitos)"
                maxLength={13}
                placeholder="0000000000000"
                value={form.dpi}
                onChange={handleChange("dpi")}
              />

              {/* Phone */}
              <Field
                required
                error={fieldErrors.number}
                id="reg-number"
                label="Teléfono (8 dígitos)"
                maxLength={8}
                placeholder="55551234"
                type="tel"
                value={form.number}
                onChange={handleChange("number")}
              />

              {/* Email — full width */}
              <div className="md:col-span-2">
                <Field
                  required
                  error={fieldErrors.email}
                  id="reg-email"
                  label="Correo Electrónico"
                  placeholder="usuario@dominio.com"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>

              {/* Username */}
              <Field
                required
                error={fieldErrors.userName}
                id="reg-username"
                label="Nombre de Usuario (8-9 chars)"
                maxLength={9}
                minLength={8}
                placeholder="miusuario"
                value={form.userName}
                onChange={handleChange("userName")}
              />

              {/* Password */}
              <Field
                required
                error={fieldErrors.password}
                id="reg-password"
                label="Contraseña (mín. 12 chars)"
                placeholder="Mínimo 12 caracteres"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
              />

              {/* NIT — optional */}
              <Field
                error={fieldErrors.nit}
                id="reg-nit"
                label="NIT (8-9 chars, opcional)"
                maxLength={9}
                placeholder="12345678"
                value={form.nit ?? ""}
                onChange={handleChange("nit")}
              />

              {/* Insurance — optional */}
              <Field
                error={fieldErrors.insuranceNumber}
                id="reg-insurance"
                label="No. Seguro Médico (opcional)"
                maxLength={50}
                placeholder="Número de afiliado"
                value={form.insuranceNumber ?? ""}
                onChange={handleChange("insuranceNumber")}
              />
            </div>

            {/* Submit */}
            <button
              className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <i className="bi bi-hourglass-split animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus" />
                  Registrarse
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col items-center mt-6 gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">¿Ya tiene cuenta?</span>
            <Link
              className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
              to={nameRoutes.portalLogin}
            >
              <i className="bi bi-box-arrow-in-right mr-1" />
              Iniciar Sesión
            </Link>
            <Link
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs mt-1"
              to={nameRoutes.portalHome}
            >
              <i className="bi bi-arrow-left mr-1" />
              Volver al portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PortalRegisterPage;

export function Component() {
  return <PortalRegisterPage />;
}
Component.displayName = "PortalRegisterPage";
