import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { SpecialtyForm } from "../../components/form/SpecialtyForm";
import { createSpecialty } from "../../services/specialtyService";
import type { SpecialtyRequest } from "../../types/SpecialtyResponse";

export function CreateSpecialtyPage() {
  const client = useQueryClient();

  const initialData: SpecialtyRequest = { name: "", description: "", state: 1 };

  const onSubmit = useCallback(
    async (form: SpecialtyRequest) => {
      const response = await createSpecialty(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["specialties"] });
      toast.success(`El registro ${form.name} ha sido creado exitosamente.`);
      return response;
    },
    [client],
  );

  return <SpecialtyForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
