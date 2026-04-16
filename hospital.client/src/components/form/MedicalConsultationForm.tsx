import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { AsyncButton } from "../button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import type { ApiResponse } from "../../types/ApiResponse";
import type { MedicalConsultationRequest } from "../../types/MedicalConsultationResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { validateMedicalConsultation } from "../../validations/medicalConsultationValidation";
import { Response } from "../messages/Response";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";

interface MedicalConsultationFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: MedicalConsultationRequest;
  readonly onSubmit: (form: MedicalConsultationRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
}

export function MedicalConsultationForm({ type, initialForm, onSubmit }: MedicalConsultationFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<MedicalConsultationRequest, unknown>(initialForm, validateMedicalConsultation, onSubmit, true);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  const handleSelectChange = useCallback(
    (name: string) => (newValue: OptionValue) => {
      const value = newValue && !Array.isArray(newValue) && "value" in newValue
        ? Number((newValue as { value: string }).value) : null;
      handleChange({ target: { name, value } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Editar Consulta Médica" : "Nueva Consulta Médica"}
      </h1>
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.appointmentId} name="appointmentId" onChange={handleTextChange("appointmentId")}>
            <Label className="font-bold">ID de Cita</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" value={form.appointmentId?.toString() || ""} />
            {errors?.appointmentId ? <FieldError>{errors.appointmentId as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.doctorId} name="doctorId" onChange={handleTextChange("doctorId")}>
            <Label className="font-bold">ID Médico</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" value={form.doctorId?.toString() || ""} />
            {errors?.doctorId ? <FieldError>{errors.doctorId as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.reasonForVisit} name="reasonForVisit" onChange={handleTextChange("reasonForVisit")}>
            <Label className="font-bold">Motivo de Visita</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.reasonForVisit || ""} />
            {errors?.reasonForVisit ? <FieldError>{errors.reasonForVisit as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.clinicalFindings} name="clinicalFindings" onChange={handleTextChange("clinicalFindings")}>
            <Label className="font-bold">Hallazgos Clínicos</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.clinicalFindings || ""} />
            {errors?.clinicalFindings ? <FieldError>{errors.clinicalFindings as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1" isInvalid={!!errors?.diagnosisCie10Code} name="diagnosisCie10Code" onChange={handleTextChange("diagnosisCie10Code")}>
            <Label className="font-bold">Código CIE-10</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" placeholder="Ej: J06.9" value={form.diagnosisCie10Code || ""} />
            {errors?.diagnosisCie10Code ? <FieldError>{errors.diagnosisCie10Code as string}</FieldError> : null}
          </TextField>
          <OptionsSelect
            isRequired
            defaultValue={form.consultationStatus !== null && form.consultationStatus !== undefined
              ? { label: form.consultationStatus === 0 ? "En curso" : "Finalizada", value: String(form.consultationStatus) }
              : { label: "En curso", value: "0" }}
            errorMessage={errors?.consultationStatus as string}
            isInvalid={!!errors?.consultationStatus}
            label="Estado de Consulta"
            name="consultationStatus"
            options={[{ label: "En curso", value: "0" }, { label: "Finalizada", value: "1" }]}
            placeholder="Seleccione estado"
            onChange={handleSelectChange("consultationStatus")}
          />
          <TextField className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.diagnosis} name="diagnosis" onChange={handleTextChange("diagnosis")}>
            <Label className="font-bold">
              Diagnóstico <span className="text-sm text-gray-500">(obligatorio para finalizar)</span>
            </Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.diagnosis || ""} />
            {errors?.diagnosis ? <FieldError>{errors.diagnosis as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.treatmentPlan} name="treatmentPlan" onChange={handleTextChange("treatmentPlan")}>
            <Label className="font-bold">Plan de Tratamiento</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.treatmentPlan || ""} />
            {errors?.treatmentPlan ? <FieldError>{errors.treatmentPlan as string}</FieldError> : null}
          </TextField>
          <TextField className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.notes} name="notes" onChange={handleTextChange("notes")}>
            <Label className="font-bold">Notas Adicionales</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.notes || ""} />
            {errors?.notes ? <FieldError>{errors.notes as string}</FieldError> : null}
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
            onChange={handleSelectChange("state")}
          />
        </div>
        <div className="flex gap-4 justify-end mt-4">
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate("/medical-consultation")}>
            Cancelar
          </AsyncButton>
          <AsyncButton className="font-bold" isLoading={loading} loadingText={isEditing ? "Actualizando..." : "Guardando..."} size="lg" type="submit" variant="primary">
            {isEditing ? "Actualizar" : "Guardar Consulta"}
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}
