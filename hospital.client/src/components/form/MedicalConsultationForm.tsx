import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { useCie10Autocomplete } from "../../hooks/useCie10Autocomplete";
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
  readonly fromDoctorDashboard?: boolean;
  readonly patientName?: string;
  readonly doctorName?: string;
}

export function MedicalConsultationForm({ type, initialForm, onSubmit, fromDoctorDashboard = false, patientName, doctorName }: MedicalConsultationFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const [cie10Query, setCie10Query] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, isLoading: cie10Loading } = useCie10Autocomplete(cie10Query);

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
      <h1 className="text-2xl font-bold text-center mb-2">
        {isEditing ? "Editar Consulta Médica" : "Nueva Consulta Médica"}
      </h1>
      {fromDoctorDashboard && (patientName || doctorName || initialForm.appointmentId) && (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-700">
          <div className="flex flex-wrap gap-4 text-sm text-blue-700 dark:text-blue-300 justify-center">
            {initialForm.appointmentId && (
              <span><i className="bi bi-hash mr-1" />Cita: <strong>#{initialForm.appointmentId}</strong></span>
            )}
            {patientName && (
              <span><i className="bi bi-person-check mr-1" />Paciente: <strong>{patientName}</strong></span>
            )}
            {doctorName && (
              <span><i className="bi bi-person-badge mr-1" />Médico: <strong>{doctorName}</strong></span>
            )}
          </div>
        </div>
      )}
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hide manual ID fields when coming from doctor dashboard */}
          {!fromDoctorDashboard && (
            <>
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
            </>
          )}
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
          <div className="w-full flex flex-col gap-1 relative">
            <label className="font-bold text-sm">Código CIE-10</label>
            <input
              className="w-full px-3 py-2 border rounded-md"
              type="text"
              placeholder="Buscar diagnóstico CIE-10..."
              value={cie10Query || form.diagnosisCie10Code || ""}
              onChange={(e) => {
                setCie10Query(e.target.value);
                setShowSuggestions(true);
                // Also update the form field directly
                handleChange({ target: { name: "diagnosisCie10Code", value: e.target.value } } as React.ChangeEvent<HTMLInputElement>);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {cie10Loading && <p className="text-xs text-gray-400">Buscando...</p>}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <li
                    key={item.code}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    onMouseDown={() => {
                      const value = `${item.code} - ${item.description}`;
                      setCie10Query(value);
                      handleChange({ target: { name: "diagnosisCie10Code", value } } as React.ChangeEvent<HTMLInputElement>);
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="font-mono font-semibold text-blue-700">{item.code}</span>
                    {" — "}
                    <span className="text-gray-700">{item.description}</span>
                  </li>
                ))}
              </ul>
            )}
            {errors?.diagnosisCie10Code && (
              <p className="text-danger text-sm">{errors.diagnosisCie10Code as string}</p>
            )}
          </div>
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
          {isEditing && initialForm.id && (
            <div className="flex flex-wrap gap-3 mt-2 pt-4 border-t border-gray-200">
              <p className="w-full text-sm font-semibold text-gray-600 mb-1">Acciones de la consulta:</p>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                onClick={() => navigate(`/prescription/create?consultationId=${initialForm.id}`)}
              >
                📋 Crear Receta
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                onClick={() => navigate(`/lab-order/create?consultationId=${initialForm.id}`)}
              >
                🔬 Crear Orden de Lab
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                onClick={() => navigate(`/appointment/create?followUp=true&parentConsultationId=${initialForm.id}`)}
              >
                📅 Agendar Seguimiento
              </button>
            </div>
          )}
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate(fromDoctorDashboard ? "/dashboard" : "/medical-consultation")}>
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
