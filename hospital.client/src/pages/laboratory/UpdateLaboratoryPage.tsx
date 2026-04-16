import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { LaboratoryForm } from "../../components/form/LaboratoryForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getLaboratoryById, updateLaboratory } from "../../services/laboratoryService";
import type { LaboratoryRequest } from "../../types/LaboratoryResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateLaboratoryPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["laboratoryToUpdate", id],
    queryFn: () => getLaboratoryById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: LaboratoryRequest) => {
      const response = await updateLaboratory(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["laboratories"] });
      await client.invalidateQueries({ queryKey: ["laboratoryToUpdate", id] });
      toast.success("Laboratorio actualizado correctamente");
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <LaboratoryForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
