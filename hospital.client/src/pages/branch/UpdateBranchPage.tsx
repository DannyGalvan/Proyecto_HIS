import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { BranchForm } from "../../components/form/BranchForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getBranchById, updateBranch } from "../../services/branchService";
import type { BranchRequest } from "../../types/BranchResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateBranchPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["branchToUpdate", id],
    queryFn: () => getBranchById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: BranchRequest) => {
      const response = await updateBranch(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["branches"] });
      await client.invalidateQueries({ queryKey: ["branchToUpdate", id] });
      toast.success("Sucursal actualizada correctamente");
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <BranchForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
