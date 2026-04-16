import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { VitalSignForm } from "../../components/form/VitalSignForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getVitalSignById, updateVitalSign } from "../../services/vitalSignService";
import type { VitalSignRequest } from "../../types/VitalSignResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateVitalSignPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vitalSignToUpdate", id],
    queryFn: () => getVitalSignById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: VitalSignRequest) => {
      const response = await updateVitalSign(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["vital-signs"] });
      await client.invalidateQueries({ queryKey: ["vitalSignToUpdate", id] });
      toast.success("Signos vitales actualizados correctamente");
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <VitalSignForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
