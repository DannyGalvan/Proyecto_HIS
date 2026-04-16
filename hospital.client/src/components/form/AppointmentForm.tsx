import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import type { SingleValue } from "react-select";
import { AsyncButton } from "../button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import { getAppointmentStatuses } from "../../services/appointmentStatusService";
import { getBranches } from "../../services/branchService";
import { getSpecialties } from "../../services/specialtyService";
import { getUsers } from "../../services/userService";
import type { ApiResponse } from "../../types/ApiResponse";
import type { AppointmentRequest } from "../../types/AppointmentResponse";
import type { AppointmentStatusResponse } from "../../types/AppointmentStatusResponse";
import type { BranchResponse } from "../../types/BranchResponse";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import type { UserResponse } from "../../types/UserResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { validateAppointment } from "../../validations/appointmentValidation";
import { Response } from "../messages/Response";
import { CatalogueSelect } from "../select/CatalogueSelect";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";

interface AppointmentFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: AppointmentRequest;
  readonly onSubmit: (form: AppointmentRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
}

export function AppointmentForm({ type, initialForm, onSubmit }: AppointmentFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<AppointmentRequest, unknown>(initialForm, validateAppointment, onSubmit, true);

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

  const selectorUser = useCallback(
    (item: UserResponse) => ({ label: `${item.name} (${item.userName})`, value: String(item.id) }),
    [],
  );

  const selectorSpecialty = useCallback(
    (item: SpecialtyResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorBranch = useCallback(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorStatus = useCallback(
    (item: AppointmentStatusResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Editar Cita" : "Agendar Cita"}
      </h1>
      {success != null && <Response message={message} type={success} />}
      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogueSelect
            isRequired
            defaultValue={isEditing && form.patientId ? { label: String(form.patientId), value: String(form.patientId) } : null}
            deps="State:eq:1"
            errorMessage={errors?.patientId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.patientId}
            label="Paciente"
            name="patientId"
            placeholder="Buscar paciente..."
            queryFn={getUsers}
            selectorFn={selectorUser}
            onChange={handleSelectChange("patientId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={isEditing && form.doctorId ? { label: String(form.doctorId), value: String(form.doctorId) } : null}
            deps="State:eq:1"
            errorMessage={errors?.doctorId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.doctorId}
            label="Médico"
            name="doctorId"
            placeholder="Buscar médico..."
            queryFn={getUsers}
            selectorFn={selectorUser}
            onChange={handleSelectChange("doctorId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={isEditing && form.specialtyId ? { label: String(form.specialtyId), value: String(form.specialtyId) } : null}
            deps="State:eq:1"
            errorMessage={errors?.specialtyId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.specialtyId}
            label="Especialidad"
            name="specialtyId"
            placeholder="Seleccione especialidad"
            queryFn={getSpecialties}
            selectorFn={selectorSpecialty}
            onChange={handleSelectChange("specialtyId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={isEditing && form.branchId ? { label: String(form.branchId), value: String(form.branchId) } : null}
            deps="State:eq:1"
            errorMessage={errors?.branchId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.branchId}
            label="Sucursal"
            name="branchId"
            placeholder="Seleccione sucursal"
            queryFn={getBranches}
            selectorFn={selectorBranch}
            onChange={handleSelectChange("branchId")}
          />
          <CatalogueSelect
            isRequired
            defaultValue={isEditing && form.appointmentStatusId ? { label: String(form.appointmentStatusId), value: String(form.appointmentStatusId) } : null}
            deps="State:eq:1"
            errorMessage={errors?.appointmentStatusId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.appointmentStatusId}
            label="Estado de Cita"
            name="appointmentStatusId"
            placeholder="Seleccione estado"
            queryFn={getAppointmentStatuses}
            selectorFn={selectorStatus}
            onChange={handleSelectChange("appointmentStatusId")}
          />
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.appointmentDate} name="appointmentDate" onChange={handleTextChange("appointmentDate")}>
            <Label className="font-bold">Fecha y Hora de la Cita</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="datetime-local" value={form.appointmentDate || ""} />
            {errors?.appointmentDate ? <FieldError>{errors.appointmentDate as string}</FieldError> : null}
          </TextField>
          <TextField isRequired className="w-full flex flex-col gap-1 md:col-span-2" isInvalid={!!errors?.reason} name="reason" onChange={handleTextChange("reason")}>
            <Label className="font-bold">Motivo de Consulta (10–2000 caracteres)</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="text" value={form.reason || ""} />
            {errors?.reason ? <FieldError>{errors.reason as string}</FieldError> : null}
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
            onChange={handleStateChange}
          />
        </div>
        <div className="flex gap-4 justify-end mt-4">
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate("/appointment")}>
            Cancelar
          </AsyncButton>
          <AsyncButton className="font-bold" isLoading={loading} loadingText={isEditing ? "Actualizando..." : "Agendando..."} size="lg" type="submit" variant="primary">
            {isEditing ? "Actualizar" : "Agendar Cita"}
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}
