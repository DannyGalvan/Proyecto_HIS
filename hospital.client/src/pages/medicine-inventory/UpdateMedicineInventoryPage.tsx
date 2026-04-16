import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { MedicineInventoryForm } from "../../components/form/MedicineInventoryForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getMedicineInventoryById, updateMedicineInventory } from "../../services/medicineService";
import type { MedicineInventoryRequest } from "../../types/MedicineInventoryResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateMedicineInventoryPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["inventoryToUpdate", id],
    queryFn: () => getMedicineInventoryById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: MedicineInventoryRequest) => {
      const response = await updateMedicineInventory(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["medicine-inventory"] });
      await client.invalidateQueries({ queryKey: ["inventoryToUpdate", id] });
      toast.success("Inventario actualizado correctamente");

      // Alerta de stock bajo
      if (data?.success && data.data.medicine) {
        const minStock = data.data.medicine.minimumStock ?? 0;
        if (form.currentStock !== null && form.currentStock !== undefined && Number(form.currentStock) <= minStock) {
          toast.danger(`⚠️ Stock bajo: El medicamento "${data.data.medicine.name}" ha alcanzado el nivel mínimo (${minStock}). Se requiere reorden.`);
        }
      }

      return response;
    },
    [client, id, data],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <MedicineInventoryForm
          initialForm={data.data}
          type="edit"
          currentMinimumStock={data.data.medicine?.minimumStock}
          onSubmit={onSubmit}
        />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
