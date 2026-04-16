import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { AsyncButton } from "../button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import type { ApiResponse } from "../../types/ApiResponse";
import type { LaboratoryRequest } from "../../types/LaboratoryResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { validateLaboratory } from "../../validations/laboratoryValidation";
import { Response } from "../messages/Response";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";

interface LaboratoryFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: LaboratoryRequest;
  readonly onSubmit: (form: LaboratoryRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
}

export function LaboratoryForm({ type, initialForm, onSubmit }: LaboratoryFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<LaboratoryRequest, unknown>(initialForm, validateLaboratory, onSubmit, true);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  const handleStateChange = useCallback(
    (newValue: OptionValue) => {
      const value = newValue && !Array.isArray(newValue) && "value" in newValue
        ? Number((newValue as { value: string }).value) : null;
      handleChange({ target: { name: "state", value } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Editar Laboratorio" : "Crear Laboratorio"}
      </h1>
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.name} name="name" onChange={handleTextChange("name")}>
          <Label className="font-bold">Nombre</Label>
          <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.name || ""} />
          {errors?.name ? <FieldError>{errors.name as string}</FieldError> : null}
        </TextField>
        <TextField className="w-full flex flex-col gap-1" isInvalid={!!errors?.description} name="description" onChange={handleTextChange("description")}>
          <Label className="font-bold">Descripción</Label>
          <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.description || ""} />
          {errors?.description ? <FieldError>{errors.description as string}</FieldError> : null}
        </TextField>
        <OptionsSelect
          isRequired
          defaultValue={form.state !== null && form.state !== undefined
            ? { label: form.state === 1 ? "Activo" : "Inactivo", value: String(form.state) }
            : { label: "Activo", value: "1" }}
          errorMessage={errors?.state as string}
          isInvalid={!!errors?.state}
          label="Estado"
          name="state"
          options={[{ label: "Activo", value: "1" }, { label: "Inactivo", value: "0" }]}
          placeholder="Seleccione un estado"
          onChange={handleStateChange}
        />
        <div className="flex gap-4 justify-end mt-4">
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate("/laboratory")}>
            Cancelar
          </AsyncButton>
          <AsyncButton className="font-bold" isLoading={loading} loadingText={isEditing ? "Actualizando..." : "Creando..."} size="lg" type="submit" variant="primary">
            {isEditing ? "Actualizar" : "Crear"}
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}
