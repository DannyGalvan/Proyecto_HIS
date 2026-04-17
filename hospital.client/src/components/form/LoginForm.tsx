import {
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { Link } from "react-router";
import { nameRoutes } from "../../configs/constants";
import { useForm } from "../../hooks/useForm";
import type { ApiResponse } from "../../types/ApiResponse";
import { validateLogin } from "../../validations/loginValidation";
import { AsyncButton } from "../button/AsyncButton";
import { PasswordVisibilityToggle } from "../input/PasswordVisibilityToggle";
import { Response } from "../messages/Response";

export interface LoginFormData {
  userName: string;
  password: string;
}

export interface LoginFormProps {
  readonly initialForm: LoginFormData;
  readonly onSubmit: (form: LoginFormData) => Promise<ApiResponse<unknown>>;
}

export function LoginForm({ initialForm, onSubmit }: LoginFormProps) {
  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<LoginFormData, unknown>(initialForm, validateLogin, onSubmit);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({
        target: { name, value: val },
      } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  return (
    <>
      {success != null && <Response message={message} type={success} />}
      <Form
        className="flex flex-col w-full"
        validationErrors={errors}
        onSubmit={handleSubmit}
      >
        <TextField
          isRequired
          className="w-full flex flex-col gap-1"
          isInvalid={!!errors?.userName}
          name="userName"
          onChange={handleTextChange("userName")}
        >
          <Label className="font-bold">Nombre de usuario</Label>
          <Input
            className="w-full px-3 py-2 border rounded-md"
            type="text"
            value={form.userName || ""}
            variant="primary"
          />
          {errors?.userName ? (
            <FieldError>{errors.userName as string}</FieldError>
          ) : null}
        </TextField>

        <PasswordVisibilityToggle
          isInvalid={!!errors?.password}
          isRequired
          errorMessage={errors?.password as string}
          label="Contraseña"
          name="password"
          value={form.password || ""}
          onChange={handleTextChange("password")}
        />

        <AsyncButton
          className="py-4 mt-4 font-bold w-full"
          isLoading={loading}
          loadingText="Iniciando sesión..."
          size="lg"
          type="submit"
          variant="primary"
        >
          Iniciar Sesión
        </AsyncButton>
      </Form>
      <div className="flex flex-col items-center mt-4 gap-2">
        <Link
          className="font-bold underline text-cyan-500"
          to={nameRoutes.forgotPassword}
        >
          ¿Olvidó su contraseña?
        </Link>
      </div>
    </>
  );
}
