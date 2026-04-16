import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { MedicineInventoryForm } from "../../components/form/MedicineInventoryForm";
import { createMedicineInventory } from "../../services/medicineService";
import type { MedicineInventoryRequest } from "../../types/MedicineInventoryResponse";

export function CreateMedicineInventoryPage() {
  const client = useQueryClient();

  const initialData: MedicineInventoryRequest = {
    medicineId: null, branchId: null, currentStock: null, state: 1,
  };

  const onSubmit = useCallback(
    async (form: MedicineInventoryRequest) => {
      const response = await createMedicineInventory(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["medicine-inventory"] });
      toast.success("Inventario registrado correctamente");
      return response;
    },
    [client],
  );

  return <MedicineInventoryForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
