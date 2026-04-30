import { Button } from "@heroui/react";
import { useCallback } from "react";
import type { UserResponse } from "../../types/UserResponse";

interface DoctorRowProps {
  readonly doctor: UserResponse;
  readonly onEdit: (doctor: UserResponse) => void;
}

export function DoctorRow({ doctor, onEdit }: DoctorRowProps) {
  const handleEdit = useCallback(() => onEdit(doctor), [doctor, onEdit]);
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
      <td className="px-4 py-3 font-medium">{doctor.name}</td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
        {doctor.branch?.name ?? (
          <span className="text-orange-500 italic">Sin asignar</span>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
        {doctor.specialty?.name ?? (
          <span className="text-orange-500 italic">Sin asignar</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Button size="sm" variant="secondary" onPress={handleEdit}>
          <i className="bi bi-pencil mr-1" />
          Editar Sede/Especialidad
        </Button>
      </td>
    </tr>
  );
}
