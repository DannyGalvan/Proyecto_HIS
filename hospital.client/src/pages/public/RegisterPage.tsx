import { Card, Form, toast } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { RegisterField } from "../../components/auth/RegisterField";
import { LogoHIS } from "../../components/brand/LogoHIS";
import { AsyncButton } from "../../components/button/AsyncButton";
import { Response } from "../../components/messages/Response";
import { api } from "../../configs/axios/interceptors";
import { useForm } from "../../hooks/useForm";
import type { ApiResponse } from "../../types/ApiResponse";
import type { RegisterFormData } from "../../validations/registerValidation";
import { validateRegister } from "../../validations/registerValidation";

const initialForm: RegisterFormData = {
  name: "",
  identificationDocument: "",
  userName: "",
  password: "",
  email: "",
  number: "",
  nit: "",
  insuranceNumber: "",
};

export function RegisterPage() {
  const navigate = useNavigate();

  const handleNavigateLogin = useCallback(() => navigate("/auth"), [navigate]);

  const petition = useCallback(
    async (form: RegisterFormData): Promise<ApiResponse<unknown>> => {
      const response = await api.post<
        unknown,
        ApiResponse<unknown>,
        RegisterFormData & { state: number; createdBy: null }
      >("/Auth/Register", { ...form, state: 1, createdBy: null });

      if (response.success) {
        toast.success(
          "¡Registro exitoso! Bienvenido(a). Ahora puede agendar su cita.",
        );
        setTimeout(() => navigate("/appointment/create"), 2000);
      }

      return response;
    },
    [navigate],
  );

  const {
    form,
    errors,
    handleChange,
    handleSubmit,
    success,
    message,
    loading,
  } = useForm<RegisterFormData, unknown>(
    initialForm,
    validateRegister,
    petition,
    true,
  );

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({
        target: { name, value: val },
      } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  return (
    <section className="flex flex-col md:flex-row justify-center items-center w-screen min-h-screen login-bg relative overflow-hidden py-8">
      <div className="flex items-center px-6 md:mx-auto w-full md:max-w-2xl">
        <Card className="w-full shadow-[0px_20px_20px_10px_#A0AEC0] login-card">
          <div className="p-8 flex flex-col w-full">
            <div className="flex justify-center mb-6">
              <LogoHIS height="auto" width="160px" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">
              Registro de Paciente
            </h1>
            <p className="text-gray-500 text-sm text-center mb-6">
              Complete sus datos para registrarse y agendar citas médicas.
            </p>

            {success != null && <Response message={message} type={success} />}

            <Form
              className="flex flex-col gap-4"
              validationErrors={errors}
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RegisterField
                  isRequired
                  className="flex flex-col gap-1 md:col-span-2"
                  error={errors?.name as string | undefined}
                  isInvalid={!!errors?.name}
                  label="Nombre Completo *"
                  name="name"
                  placeholder="Mínimo 10 caracteres"
                  value={form.name}
                  onChange={handleTextChange("name")}
                />

                <RegisterField
                  isRequired
                  error={errors?.identificationDocument as string | undefined}
                  isInvalid={!!errors?.identificationDocument}
                  label="DPI * (13 dígitos)"
                  maxLength={13}
                  name="identificationDocument"
                  placeholder="1234567890123"
                  value={form.identificationDocument}
                  onChange={handleTextChange("identificationDocument")}
                />

                <RegisterField
                  isRequired
                  error={errors?.number as string | undefined}
                  isInvalid={!!errors?.number}
                  label="Teléfono * (8 dígitos)"
                  maxLength={8}
                  name="number"
                  placeholder="55551234"
                  type="tel"
                  value={form.number}
                  onChange={handleTextChange("number")}
                />

                <RegisterField
                  isRequired
                  className="flex flex-col gap-1 md:col-span-2"
                  error={errors?.email as string | undefined}
                  isInvalid={!!errors?.email}
                  label="Correo Electrónico *"
                  name="email"
                  placeholder="usuario@dominio.com"
                  type="email"
                  value={form.email}
                  onChange={handleTextChange("email")}
                />

                <RegisterField
                  isRequired
                  error={errors?.userName as string | undefined}
                  isInvalid={!!errors?.userName}
                  label="Nombre de Usuario * (8-9 chars)"
                  maxLength={9}
                  minLength={8}
                  name="userName"
                  placeholder="miusuario"
                  value={form.userName}
                  onChange={handleTextChange("userName")}
                />

                <RegisterField
                  isRequired
                  error={errors?.password as string | undefined}
                  isInvalid={!!errors?.password}
                  label="Contraseña * (mín. 12 chars)"
                  name="password"
                  placeholder="Mínimo 12 caracteres"
                  type="password"
                  value={form.password}
                  onChange={handleTextChange("password")}
                />

                <RegisterField
                  error={errors?.nit as string | undefined}
                  isInvalid={!!errors?.nit}
                  label="NIT (8-9 chars, opcional)"
                  name="nit"
                  placeholder="12345678"
                  value={form.nit || ""}
                  onChange={handleTextChange("nit")}
                />

                <RegisterField
                  error={errors?.insuranceNumber as string | undefined}
                  isInvalid={!!errors?.insuranceNumber}
                  label="No. Seguro Médico (opcional)"
                  name="insuranceNumber"
                  placeholder="Número de afiliado"
                  value={form.insuranceNumber || ""}
                  onChange={handleTextChange("insuranceNumber")}
                />
              </div>

              <AsyncButton
                className="py-3 mt-2 font-bold w-full"
                isLoading={loading}
                loadingText="Registrando..."
                size="lg"
                type="submit"
                variant="primary"
              >
                <i className="bi bi-person-plus mr-2" /> Registrarse
              </AsyncButton>
            </Form>

            <div className="flex flex-col items-center mt-4 gap-2 text-sm">
              <span className="text-gray-500">¿Ya tiene cuenta?</span>
              <button
                className="font-bold underline text-cyan-500"
                type="button"
                onClick={handleNavigateLogin}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
