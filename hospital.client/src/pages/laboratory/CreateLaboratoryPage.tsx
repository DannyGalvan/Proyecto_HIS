import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { LaboratoryForm } from "../../components/form/LaboratoryForm";
import { createLaboratory } from "../../services/laboratoryService";
import type { LaboratoryRequest } from "../../types/LaboratoryResponse";

export function CreateLaboratoryPage() {
  const client = useQueryClient();

  const initialData: LaboratoryRequest = { name: "", description: "", state: 1 };

  const onSubmit = useCallback(
    async (form: LaboratoryRequest) => {
      const response = await createLaboratory(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["laboratories"] });
      toast.success("Laboratorio creado correctamente");
      return response;
    },
    [client],
  );

  return <LaboratoryForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
