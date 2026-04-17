import { Card, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { AsyncButton } from "../../components/button/AsyncButton";
import { Response } from "../../components/messages/Response";
import { useForm } from "../../hooks/useForm";
import { Images } from "../../assets/images/images";
import { LogoHIS } from "../../components/brand/LogoHIS";
import { api } from "../../configs/axios/interceptors";
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

  const petition = useCallback(async (form: RegisterFormData): Promise<ApiResponse<unknown>> => {
    const response = await api.post<unknown, ApiResponse<unknown>, RegisterFormData & { state: number; createdBy: null }>(
      "/Auth/Register",
      { ...form, state: 1, createdBy: null },
    );

    if (response.success) {
      toast.success("¡Registro exitoso! Bienvenido(a). Ahora puede agendar su cita.");
      setTimeout(() => navigate("/appointment/create"), 2000);
    }

    return response;
  }, [navigate]);

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<RegisterFormData, unknown>(initialForm, validateRegister, petition, true);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
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
            <h1 className="text-2xl font-bold text-center mb-2">Registro de Paciente</h1>
            <p className="text-gray-500 text-sm text-center mb-6">
              Complete sus datos para registrarse y agendar citas médicas.
            </p>

            {success != null && <Response message={message} type={success} />}

            <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField isRequired className="flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.name} name="name" onChange={handleTextChange("name")}>
                  <Label className="font-bold">Nombre Completo *</Label>
                  <Input className="px-3 py-2 border rounded-md" type="text" value={form.name} placeholder="Mínimo 10 caracteres" />
                  {errors?.name ? <FieldError>{errors.name as string}</FieldError> : null}
                </TextField>

                <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.identificationDocument} name="identificationDocument" onChange={handleTextChange("identificationDocument")}>
                  <Label className="font-bold">DPI * (13 dígitos)</Label>
                  <Input className="px-3 py-2 border rounded-md" type="text" maxLength={13} value={form.identificationDocument} placeholder="1234567890123" />
                  {errors?.identificationDocument ? <FieldError>{errors.identificationDocument as string}</FieldError> : null}
                </TextField>

                <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.number} name="number" onChange={handleTextChange("number")}>
                  <Label className="font-bold">Teléfono * (8 dígitos)</Label>
                  <Input className="px-3 py-2 border rounded-md" type="tel" maxLength={8} value={form.number} placeholder="55551234" />
                  {errors?.number ? <FieldError>{errors.number as string}</FieldError> : null}
                </TextField>

                <TextField isRequired className="flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.email} name="email" onChange={handleTextChange("email")}>
                  <Label className="font-bold">Correo Electrónico *</Label>
                  <Input className="px-3 py-2 border rounded-md" type="email" value={form.email} placeholder="usuario@dominio.com" />
                  {errors?.email ? <FieldError>{errors.email as string}</FieldError> : null}
                </TextField>

                <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.userName} name="userName" onChange={handleTextChange("userName")}>
                  <Label className="font-bold">Nombre de Usuario * (8-9 chars)</Label>
                  <Input className="px-3 py-2 border rounded-md" type="text" minLength={8} maxLength={9} value={form.userName} placeholder="miusuario" />
                  {errors?.userName ? <FieldError>{errors.userName as string}</FieldError> : null}
                </TextField>

                <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.password} name="password" onChange={handleTextChange("password")}>
                  <Label className="font-bold">Contraseña * (mín. 12 chars)</Label>
                  <Input className="px-3 py-2 border rounded-md" type="password" value={form.password} placeholder="Mínimo 12 caracteres" />
                  {errors?.password ? <FieldError>{errors.password as string}</FieldError> : null}
                </TextField>

                <TextField className="flex flex-col gap-1" isInvalid={!!errors?.nit} name="nit" onChange={handleTextChange("nit")}>
                  <Label className="font-bold">NIT (8-9 chars, opcional)</Label>
                  <Input className="px-3 py-2 border rounded-md" type="text" value={form.nit || ""} placeholder="12345678" />
                  {errors?.nit ? <FieldError>{errors.nit as string}</FieldError> : null}
                </TextField>

                <TextField className="flex flex-col gap-1" isInvalid={!!errors?.insuranceNumber} name="insuranceNumber" onChange={handleTextChange("insuranceNumber")}>
                  <Label className="font-bold">No. Seguro Médico (opcional)</Label>
                  <Input className="px-3 py-2 border rounded-md" type="text" value={form.insuranceNumber || ""} placeholder="Número de afiliado" />
                  {errors?.insuranceNumber ? <FieldError>{errors.insuranceNumber as string}</FieldError> : null}
                </TextField>
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
                onClick={() => navigate("/auth")}
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

export function Component() {
  return <RegisterPage />;
}
Component.displayName = "RegisterPage";
