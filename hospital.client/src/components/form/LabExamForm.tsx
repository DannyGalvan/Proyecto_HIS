import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { AsyncButton } from "../button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import { getLaboratories } from "../../services/laboratoryService";
import type { ApiResponse } from "../../types/ApiResponse";
import type { LabExamRequest } from "../../types/LabExamResponse";
import type { LaboratoryResponse } from "../../types/LaboratoryResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { validateLabExam } from "../../validations/labExamValidation";
import { Response } from "../messages/Response";
import { CatalogueSelect } from "../select/CatalogueSelect";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";
import type { SingleValue } from "react-select";

interface LabExamFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: LabExamRequest;
  readonly onSubmit: (form: LabExamRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
}

export function LabExamForm({ type, initialForm, onSubmit }: LabExamFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<LabExamRequest, unknown>(initialForm, validateLabExam, onSubmit, true);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  const handleSelectChange = useCallback(
    (name: string) => (opt: OptionValue) => {
      const option = opt as SingleValue<{ label: string; value: string }>;
      handleChange({ target: { name, value: option?.value || "" } } as React.ChangeEvent<HTMLInputElement>);
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

  const selectorLaboratory = useCallback(
    (item: LaboratoryResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Editar Examen de Laboratorio" : "Crear Examen de Laboratorio"}
      </h1>
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.name} name="name" onChange={handleTextChange("name")}>
            <Label className="font-bold">Nombre del Examen</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.name || ""} />
            {errors?.name ? <FieldError>{errors.name as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.defaultAmount} name="defaultAmount" onChange={handleTextChange("defaultAmount")}>
            <Label className="font-bold">Precio Base (Q)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" step="0.01" min="0" value={form.defaultAmount?.toString() || ""} />
            {errors?.defaultAmount ? <FieldError>{errors.defaultAmount as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.description} name="description" onChange={handleTextChange("description")}>
            <Label className="font-bold">Descripción</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.description || ""} />
            {errors?.description ? <FieldError>{errors.description as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1" isInvalid={!!errors?.unit} name="unit" onChange={handleTextChange("unit")}>
            <Label className="font-bold">Unidad de Medida</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.unit || ""} />
            {errors?.unit ? <FieldError>{errors.unit as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1" isInvalid={!!errors?.referenceRange} name="referenceRange" onChange={handleTextChange("referenceRange")}>
            <Label className="font-bold">Rango de Referencia</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.referenceRange || ""} />
            {errors?.referenceRange ? <FieldError>{errors.referenceRange as string}</FieldError> : null}
          </TextField>
          <CatalogueSelect
            isRequired
            defaultValue={isEditing && form.laboratoryId ? { label: String(form.laboratoryId), value: String(form.laboratoryId) } : null}
            deps="State:eq:1"
            errorMessage={errors?.laboratoryId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.laboratoryId}
            label="Laboratorio"
            name="laboratoryId"
            placeholder="Seleccione un laboratorio"
            queryFn={getLaboratories}
            selectorFn={selectorLaboratory}
            onChange={handleSelectChange("laboratoryId")}
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
        <div className="flex gap-4 justify-end mt-4">
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate("/lab-exam")}>
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
