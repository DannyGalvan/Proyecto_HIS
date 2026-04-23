import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";

import { Field } from "../../components/input/Field";
import { nameRoutes } from "../../configs/constants";
import {
  getMyProfile,
  updateMyProfile,
} from "../../services/patientPortalService";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";
import { profileSchema } from "../../validations/profileValidations";

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

// ── Page ──────────────────────────────────────────────────────────────────────
export function Component() {
  const { userId, isLoggedIn, signInPatient, ...patientState } =
    usePatientAuthStore();

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [originalData, setOriginalData] = useState<ProfileForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  console.log("ProfilePage rendered with userId:", userId);

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
    return () => {
      cancelled = true;
    };
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

      if (form.name !== originalData.name) {
        patchData.name = form.name;
        hasChanges = true;
      }
      if (form.email !== originalData.email) {
        patchData.email = form.email;
        hasChanges = true;
      }
      if (form.number !== originalData.number) {
        patchData.number = form.number;
        hasChanges = true;
      }
      if (form.nit !== originalData.nit) {
        patchData.nit = form.nit || null;
        hasChanges = true;
      }
      if (form.insuranceNumber !== originalData.insuranceNumber) {
        patchData.insuranceNumber = form.insuranceNumber || null;
        hasChanges = true;
      }

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
          if (
            msg.toLowerCase().includes("correo") ||
            msg.toLowerCase().includes("email")
          ) {
            setApiError(
              "El correo electrónico ya está en uso por otra cuenta.",
            );
          } else {
            setApiError(msg);
          }
        }
      } catch {
        setApiError(
          "No se pudo conectar con el servidor. Intente de nuevo más tarde.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      form,
      originalData,
      userId,
      isLoggedIn,
      patientState,
      signInPatient,
      loadProfile,
    ],
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
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            to={nameRoutes.portalDashboard}
          >
            <i className="bi bi-arrow-left" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl shadow-lg border border-gray-100 p-8 bg-white dark:bg-gray-900/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <i className="bi bi-person-circle text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Mi Perfil
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Actualice su información personal
              </p>
            </div>
          </div>

          {successMessage ? (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-xl text-green-800 text-sm flex items-start gap-2 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300">
              <i className="bi bi-check-circle-fill mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          {apiError ? (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl text-red-800 text-sm flex items-start gap-2 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
              <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          ) : null}

          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
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
              className="w-full py-3 mt-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              to={nameRoutes.portalChangePassword}
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

Component.displayName = "ProfilePage";
