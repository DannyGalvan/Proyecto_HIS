import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { SpecialtyForm } from "../../components/form/SpecialtyForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getSpecialtyById, updateSpecialty } from "../../services/specialtyService";
import type { SpecialtyRequest } from "../../types/SpecialtyResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateSpecialtyPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["specialtyToUpdate", id],
    queryFn: () => getSpecialtyById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: SpecialtyRequest) => {
      const response = await updateSpecialty(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["specialties"] });
      await client.invalidateQueries({ queryKey: ["specialtyToUpdate", id] });
      toast.success(`El registro ${form.name} ha sido actualizado correctamente.`);
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <SpecialtyForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
