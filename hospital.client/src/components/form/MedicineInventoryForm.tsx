import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import type { SingleValue } from "react-select";
import { AsyncButton } from "../button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import { getBranches } from "../../services/branchService";
import { getMedicines } from "../../services/medicineService";
import type { ApiResponse } from "../../types/ApiResponse";
import type { BranchResponse } from "../../types/BranchResponse";
import type { MedicineInventoryRequest } from "../../types/MedicineInventoryResponse";
import type { MedicineResponse } from "../../types/MedicineResponse";
import type { ValidationFailure } from "../../types/ValidationFailure";
import { validateMedicineInventory } from "../../validations/medicineInventoryValidation";
import { Response } from "../messages/Response";
import { CatalogueSelect } from "../select/CatalogueSelect";
import { OptionsSelect, type OptionValue } from "../select/OptionsSelect";

interface MedicineInventoryFormProps {
  readonly type: "create" | "edit";
  readonly initialForm: MedicineInventoryRequest;
  readonly onSubmit: (form: MedicineInventoryRequest) => Promise<ApiResponse<unknown | ValidationFailure[]>>;
  readonly currentMinimumStock?: number;
}

export function MedicineInventoryForm({ type, initialForm, onSubmit, currentMinimumStock }: MedicineInventoryFormProps) {
  const isEditing = type === "edit";
  const navigate = useNavigate();

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<MedicineInventoryRequest, unknown>(initialForm, validateMedicineInventory, onSubmit, true);

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

  const selectorMedicine = useCallback(
    (item: MedicineResponse) => ({ label: `${item.name} (${item.unit})`, value: String(item.id) }),
    [],
  );

  const selectorBranch = useCallback(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const isLowStock = currentMinimumStock !== undefined &&
    form.currentStock !== null && form.currentStock !== undefined &&
    Number(form.currentStock) <= currentMinimumStock;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Ajustar Inventario" : "Registrar Inventario"}
      </h1>
      {success != null && <Response message={message} type={success} />}

      {isLowStock && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          ⚠️ <strong>Alerta de stock bajo:</strong> El stock actual ha alcanzado o está por debajo del nivel mínimo ({currentMinimumStock}). Se requiere reorden.
        </div>
      )}

      <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogueSelect
            isRequired
            defaultValue={isEditing && form.medicineId ? { label: String(form.medicineId), value: String(form.medicineId) } : null}
            deps="State:eq:1"
            errorMessage={errors?.medicineId as string}
            fieldSearch="Name"
            isInvalid={!!errors?.medicineId}
            label="Medicamento"
            name="medicineId"
            placeholder="Seleccione medicamento"
            queryFn={getMedicines}
            selectorFn={selectorMedicine}
            onChange={handleSelectChange("medicineId")}
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
          <TextField isRequired className="w-full flex flex-col gap-1" isInvalid={!!errors?.currentStock} name="currentStock" onChange={handleTextChange("currentStock")}>
            <Label className="font-bold">Stock Actual</Label>
            <Input className="w-full px-3 py-2 border rounded-md" type="number" min="0" value={form.currentStock?.toString() || ""} />
            {errors?.currentStock ? <FieldError>{errors.currentStock as string}</FieldError> : null}
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
          <AsyncButton className="font-bold" isLoading={false} size="lg" type="button" variant="secondary" onClick={() => navigate("/medicine-inventory")}>
            Cancelar
          </AsyncButton>
          <AsyncButton className="font-bold" isLoading={loading} loadingText={isEditing ? "Actualizando..." : "Registrando..."} size="lg" type="submit" variant="primary">
            {isEditing ? "Actualizar Stock" : "Registrar"}
          </AsyncButton>
        </div>
      </Form>
    </div>
  );
}
