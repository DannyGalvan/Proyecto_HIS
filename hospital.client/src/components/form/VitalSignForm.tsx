import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { AsyncButton } from "../button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import type { ApiResponse } from "../../types/ApiResponse";
import type { VitalSignRequest } from "../../types/VitalSignResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { validateVitalSign } from "../../validations/vitalSignValidation";
import { Response } from "../messages/Response";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";
import { useVitalSignAlerts } from "../../hooks/useVitalSignAlerts";
import { VitalSignAlertsDisplay } from "../shared/VitalSignAlertsDisplay";

interface VitalSignFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: VitalSignRequest;
  readonly onSubmit: (form: VitalSignRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
}

export function VitalSignForm({ type, initialForm, onSubmit }: VitalSignFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<VitalSignRequest, unknown>(initialForm, validateVitalSign, onSubmit, true);

  const alerts = useVitalSignAlerts({
    bloodPressureSystolic: form.bloodPressureSystolic ? Number(form.bloodPressureSystolic) : null,
    bloodPressureDiastolic: form.bloodPressureDiastolic ? Number(form.bloodPressureDiastolic) : null,
    temperature: form.temperature ? Number(form.temperature) : null,
    heartRate: form.heartRate ? Number(form.heartRate) : null,
  });

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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Editar Signos Vitales" : "Registrar Signos Vitales"}
      </h1>
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.appointmentId} name="appointmentId" onChange={handleTextChange("appointmentId")}>
            <Label className="font-bold">ID de Cita</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" value={form.appointmentId?.toString() || ""} />
            {errors?.appointmentId ? <FieldError>{errors.appointmentId as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.nurseId} name="nurseId" onChange={handleTextChange("nurseId")}>
            <Label className="font-bold">ID Enfermero/a</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" value={form.nurseId?.toString() || ""} />
            {errors?.nurseId ? <FieldError>{errors.nurseId as string}</FieldError> : null}
          </TextField>

          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-gray-600 mb-2">Presión Arterial</p>
            <div className="grid grid-cols-2 gap-4">
              <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.bloodPressureSystolic} name="bloodPressureSystolic" onChange={handleTextChange("bloodPressureSystolic")}>
                <Label className="font-bold">Sistólica (mmHg)</Label>
                <Input className="w-full px-3 py-2 border rounded-md" type="number" min="60" max="250" value={form.bloodPressureSystolic?.toString() || ""} />
                {errors?.bloodPressureSystolic ? <FieldError>{errors.bloodPressureSystolic as string}</FieldError> : null}
              </TextField>
              <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.bloodPressureDiastolic} name="bloodPressureDiastolic" onChange={handleTextChange("bloodPressureDiastolic")}>
                <Label className="font-bold">Diastólica (mmHg)</Label>
                <Input className="w-full px-3 py-2 border rounded-md" type="number" min="40" max="150" value={form.bloodPressureDiastolic?.toString() || ""} />
                {errors?.bloodPressureDiastolic ? <FieldError>{errors.bloodPressureDiastolic as string}</FieldError> : null}
              </TextField>
            </div>
          </div>

          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.temperature} name="temperature" onChange={handleTextChange("temperature")}>
            <Label className="font-bold">Temperatura (°C)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" step="0.1" min="34" max="42" value={form.temperature?.toString() || ""} />
            {errors?.temperature ? <FieldError>{errors.temperature as string}</FieldError> : null}
          </TextField>

          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.heartRate} name="heartRate" onChange={handleTextChange("heartRate")}>
            <Label className="font-bold">Frecuencia Cardíaca (bpm)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" min="30" max="220" value={form.heartRate?.toString() || ""} />
            {errors?.heartRate ? <FieldError>{errors.heartRate as string}</FieldError> : null}
          </TextField>

          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.weight} name="weight" onChange={handleTextChange("weight")}>
            <Label className="font-bold">Peso (kg)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" step="0.01" min="0.5" max="300" value={form.weight?.toString() || ""} />
            {errors?.weight ? <FieldError>{errors.weight as string}</FieldError> : null}
          </TextField>

          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.height} name="height" onChange={handleTextChange("height")}>
            <Label className="font-bold">Altura (cm)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" step="0.01" min="30" max="250" value={form.height?.toString() || ""} />
            {errors?.height ? <FieldError>{errors.height as string}</FieldError> : null}
          </TextField>

          <OptionsSelect
            defaultValue={form.isEmergency ? { label: "Sí 🚨", value: "true" } : { label: "No", value: "false" }}
            label="¿Emergencia?"
            name="isEmergency"
            options={[{ label: "No", value: "false" }, { label: "Sí 🚨", value: "true" }]}
            placeholder="Seleccione"
            onChange={(v) => {
              const val = v && !Array.isArray(v) && "value" in v ? (v as { value: string }).value === "true" : false;
              handleChange({ target: { name: "isEmergency", value: val } } as unknown as ChangeEvent<HTMLInputElement>);
            }}
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
        <VitalSignAlertsDisplay alerts={alerts} />
        <div className="flex gap-4 justify-end mt-4">
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate("/vital-sign")}>
            Cancelar
          </AsyncButton>
          <AsyncButton className="font-bold" isLoading={loading} loadingText={isEditing ? "Actualizando..." : "Registrando..."} size="lg" type="submit" variant="primary">
            {isEditing ? "Actualizar" : "Registrar"}
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}
