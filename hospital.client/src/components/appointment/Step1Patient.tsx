import { useCallback } from "react";
import type { MultiValue, SingleValue } from "react-select";
import { getUsers } from "../../services/userService";
import type { UserResponse } from "../../types/UserResponse";
import { CatalogueSelect } from "../select/CatalogueSelect";

interface Step1PatientProps {
  readonly onSelect: (patient: { id: number; name: string }) => void;
}

function selectorFn(user: UserResponse) {
  return {
    label: `${user.name} — ${user.identificationDocument}`,
    value: String(user.id),
  };
}

export function Step1Patient({ onSelect }: Step1PatientProps) {
  const handleChange = useCallback(
    (
      option:
        | SingleValue<{ label: string; value: string }>
        | MultiValue<{ label: string; value: string }>
        | null,
    ) => {
      if (option && !Array.isArray(option) && "value" in option) {
        const single = option as SingleValue<{ label: string; value: string }>;
        if (single) {
          onSelect({ id: Number(single.value), name: single.label });
        }
      }
    },
    [onSelect],
  );

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione un Paciente
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Busque y seleccione el paciente para la cita.
      </p>
      <CatalogueSelect<UserResponse>
        isRequired
        deps="Rol.Name:eq:Paciente AND State:eq:1"
        fieldSearch="Name"
        label="Paciente"
        placeholder="Buscar paciente por nombre..."
        queryFn={getUsers}
        selectorFn={selectorFn}
        onChange={handleChange}
      />
    </div>
  );
}
