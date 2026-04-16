import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { MedicineForm } from "../../components/form/MedicineForm";
import { createMedicine } from "../../services/medicineService";
import type { MedicineRequest } from "../../types/MedicineResponse";

export function CreateMedicinePage() {
  const client = useQueryClient();

  const initialData: MedicineRequest = {
    name: "", description: "", defaultPrice: null, unit: "",
    isControlled: false, minimumStock: 0, state: 1,
  };

  const onSubmit = useCallback(
    async (form: MedicineRequest) => {
      const response = await createMedicine(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicamento creado correctamente");
      return response;
    },
    [client],
  );

  return <MedicineForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
