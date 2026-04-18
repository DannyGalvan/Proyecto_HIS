import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { MedicineForm } from "../../components/form/MedicineForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getMedicineById, updateMedicine } from "../../services/medicineService";
import type { MedicineRequest } from "../../types/MedicineResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateMedicinePage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["medicineToUpdate", id],
    queryFn: () => getMedicineById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: MedicineRequest) => {
      const response = await updateMedicine(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["medicines"] });
      await client.invalidateQueries({ queryKey: ["medicineToUpdate", id] });
      toast.success(`El registro ${form.name} ha sido actualizado correctamente.`);
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <MedicineForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
