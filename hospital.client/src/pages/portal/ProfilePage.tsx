import { useState, useCallback, useEffect, type FormEvent } from "react";
import { Link } from "react-router";
import { z } from "zod";

import { nameRoutes } from "../../configs/constants";
import { getMyProfile, updateMyProfile } from "../../services/patientPortalService";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

// ── Zod schema ────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z
    .string()
    .min(10, "El nombre debe tener al menos 10 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido"),
  number: z
    .string()
    .regex(/^\d{8}$/, "El teléfono debe contener exactamente 8 dígitos numéricos"),
  nit: z.string().optional().or(z.literal("")),
  insuranceNumber: z.string().optional().or(z.literal("")),
});

interface ProfileForm {
  name: string;
  email: string;
  number: string;
  identificationDocument: string;
  nit: string;
  insuranceNumber: string;
}

type FieldErrors = Partial<Record<keyof ProfileForm, string>>;

const initialForm: ProfileForm = {
  name: "",
  email: "",
  number: "",
  identificationDocument: "",
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
  value: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Field({
  id,
  label,
  required = false,
  type = "text",
  placeholder,
  maxLength,
  value,
  error,
  disabled,
  readOnly,
  onChange,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${readOnly
            ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
            : error
              ? "border-red-400 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        readOnly={readOnly}
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
export function ProfilePage() {
  const { userId, isLoggedIn, signInPatient, ...patientState } = usePatientAuthStore();

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [originalData, setOriginalData] = useState<ProfileForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ── Load user data ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setIsFetching(true);
      try {
        const response = await getMyProfile();
        if (cancelled) return;
        if (response.success && response.data) {
          const user = response.data;
          const userData: ProfileForm = {
            name: user.name ?? "",
            email: user.email ?? "",
            number: user.number ?? "",
            identificationDocument: user.identificationDocument ?? "",
            nit: user.nit ?? "",
            insuranceNumber: user.insuranceNumber ?? "",
          };
          setForm(userData);
          setOriginalData(userData);
        } else {
          setApiError("No se pudieron cargar los datos del perfil.");
        }
      } catch {
        if (!cancelled) {
          setApiError("No se pudieron cargar los datos del perfil.");
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  // Reusable fetch for after updates
  const loadProfile = useCallback(async () => {
    try {
      const response = await getMyProfile();
      if (response.success && response.data) {
        const user = response.data;
        const userData: ProfileForm = {
          name: user.name ?? "",
          email: user.email ?? "",
          number: user.number ?? "",
          identificationDocument: user.identificationDocument ?? "",
          nit: user.nit ?? "",
          insuranceNumber: user.insuranceNumber ?? "",
        };
        setForm(userData);
        setOriginalData(userData);
      }
    } catch {
      // Silent — the initial load already showed the error if needed
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === "number") value = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      setApiError("");
      setSuccessMessage("");
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const result = profileSchema.safeParse({
        name: form.name,
        email: form.email,
        number: form.number,
        nit: form.nit,
        insuranceNumber: form.insuranceNumber,
      });

      if (!result.success) {
        const errs: FieldErrors = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof ProfileForm;
          if (!errs[key]) errs[key] = issue.message;
        }
        setFieldErrors(errs);
        return;
      }

      const patchData: Record<string, string | null> = {};
      let hasChanges = false;

      if (form.name !== originalData.name) { patchData.name = form.name; hasChanges = true; }
      if (form.email !== originalData.email) { patchData.email = form.email; hasChanges = true; }
      if (form.number !== originalData.number) { patchData.number = form.number; hasChanges = true; }
      if (form.nit !== originalData.nit) { patchData.nit = form.nit || null; hasChanges = true; }
      if (form.insuranceNumber !== originalData.insuranceNumber) { patchData.insuranceNumber = form.insuranceNumber || null; hasChanges = true; }

      if (!hasChanges) {
        setSuccessMessage("No se detectaron cambios en el perfil.");
        return;
      }

      setIsLoading(true);
      setApiError("");
      setSuccessMessage("");

      try {
        const response = await updateMyProfile(patchData);

        if (response.success) {
          setSuccessMessage("Perfil actualizado correctamente");
          if (patchData.name || patchData.email) {
            signInPatient({
              ...patientState,
              isLoggedIn,
              userId,
              name: patchData.name ?? patientState.name,
              email: patchData.email ?? patientState.email,
            });
          }
          await loadProfile();
        } else {
          const msg = response.message ?? "Error al actualizar el perfil.";
          if (msg.toLowerCase().includes("correo") || msg.toLowerCase().includes("email")) {
            setApiError("El correo electrónico ya está en uso por otra cuenta.");
          } else {
            setApiError(msg);
          }
        }
      } catch {
        setApiError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [form, originalData, userId, isLoggedIn, patientState, signInPatient, loadProfile],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <section className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center gap-3">
          <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-[calc(100vh-140px)] bg-white dark:bg-gray-800 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to={nameRoutes.portalDashboard}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <i className="bi bi-arrow-left" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl shadow-lg border border-gray-100 p-8 ">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <i className="bi bi-person-circle text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mi Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Actualice su información personal</p>
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-xl text-green-800 text-sm flex items-start gap-2 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300">
              <i className="bi bi-check-circle-fill mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl text-red-800 text-sm flex items-start gap-2 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
              <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field
                  required
                  error={fieldErrors.name}
                  id="profile-name"
                  label="Nombre Completo"
                  maxLength={100}
                  placeholder="Mínimo 10 caracteres"
                  value={form.name}
                  onChange={handleChange("name")}
                />
              </div>

              <div className="md:col-span-2">
                <Field
                  required
                  error={fieldErrors.email}
                  id="profile-email"
                  label="Correo Electrónico"
                  placeholder="usuario@dominio.com"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>

              <Field
                required
                error={fieldErrors.number}
                id="profile-number"
                label="Teléfono (8 dígitos)"
                maxLength={8}
                placeholder="55551234"
                type="tel"
                value={form.number}
                onChange={handleChange("number")}
              />

              <Field
                readOnly
                id="profile-dpi"
                label="DPI (No editable)"
                value={form.identificationDocument}
              />

              <Field
                error={fieldErrors.nit}
                id="profile-nit"
                label="NIT (opcional)"
                maxLength={9}
                placeholder="12345678"
                value={form.nit}
                onChange={handleChange("nit")}
              />

              <Field
                error={fieldErrors.insuranceNumber}
                id="profile-insurance"
                label="No. Seguro Médico (opcional)"
                maxLength={50}
                placeholder="Número de afiliado"
                value={form.insuranceNumber}
                onChange={handleChange("insuranceNumber")}
              />
            </div>

            <button
              className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <i className="bi bi-hourglass-split animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-floppy" />
                  Guardar Cambios
                </>
              )}
            </button>

            {/* Change password link */}
            <Link
              to={nameRoutes.portalChangePassword}
              className="w-full py-3 mt-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <i className="bi bi-shield-lock" />
              Cambiar Contraseña
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;

export function Component() {
  return <ProfilePage />;
}
Component.displayName = "ProfilePage";