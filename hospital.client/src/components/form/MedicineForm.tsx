import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { AsyncButton } from "../button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import type { ApiResponse } from "../../types/ApiResponse";
import type { MedicineRequest } from "../../types/MedicineResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { validateMedicine } from "../../validations/medicineValidation";
import { Response } from "../messages/Response";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";

interface MedicineFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: MedicineRequest;
  readonly onSubmit: (form: MedicineRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
}

export function MedicineForm({ type, initialForm, onSubmit }: MedicineFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<MedicineRequest, unknown>(initialForm, validateMedicine, onSubmit, true);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  const handleSelectChange = useCallback(
    (name: string) => (newValue: OptionValue) => {
      const value = newValue && !Array.isArray(newValue) && "value" in newValue
        ? (newValue as { value: string }).value : null;
      handleChange({ target: { name, value } } as unknown as ChangeEvent<HTMLInputElement>);
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
        {isEditing ? "Editar Medicamento" : "Crear Medicamento"}
      </h1>
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.name} name="name" onChange={handleTextChange("name")}>
            <Label className="font-bold">Nombre</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.name || ""} />
            {errors?.name ? <FieldError>{errors.name as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.unit} name="unit" onChange={handleTextChange("unit")}>
            <Label className="font-bold">Unidad (tableta, ml, etc.)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.unit || ""} />
            {errors?.unit ? <FieldError>{errors.unit as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.description} name="description" onChange={handleTextChange("description")}>
            <Label className="font-bold">Descripción</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.description || ""} />
            {errors?.description ? <FieldError>{errors.description as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.defaultPrice} name="defaultPrice" onChange={handleTextChange("defaultPrice")}>
            <Label className="font-bold">Precio Unitario (Q)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" step="0.01" min="0" value={form.defaultPrice?.toString() || ""} />
            {errors?.defaultPrice ? <FieldError>{errors.defaultPrice as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1" isInvalid={!!errors?.minimumStock} name="minimumStock" onChange={handleTextChange("minimumStock")}>
            <Label className="font-bold">Stock Mínimo</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" min="0" value={form.minimumStock?.toString() || ""} />
            {errors?.minimumStock ? <FieldError>{errors.minimumStock as string}</FieldError> : null}
          </TextField>
          <OptionsSelect
            defaultValue={form.isControlled !== null && form.isControlled !== undefined
              ? { label: form.isControlled ? "Sí" : "No", value: String(form.isControlled) }
              : { label: "No", value: "false" }}
            errorMessage={errors?.isControlled as string}
            isInvalid={!!errors?.isControlled}
            label="¿Medicamento Controlado?"
            name="isControlled"
            options={[{ label: "No", value: "false" }, { label: "Sí ⚠️", value: "true" }]}
            placeholder="Seleccione"
            onChange={handleSelectChange("isControlled")}
          />
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
        </div>
        {form.isControlled && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
            ⚠️ Este medicamento está marcado como controlado. Se aplicará auditoría especial en cada despacho.
          </div>
        )}
        <div className="flex gap-4 justify-end mt-4">
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate("/medicine")}>
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
