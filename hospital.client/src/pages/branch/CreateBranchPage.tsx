import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { BranchForm } from "../../components/form/BranchForm";
import { createBranch } from "../../services/branchService";
import type { BranchRequest } from "../../types/BranchResponse";

export function CreateBranchPage() {
  const client = useQueryClient();

  const initialData: BranchRequest = { name: "", phone: "", address: "", description: "", state: 1 };

  const onSubmit = useCallback(
    async (form: BranchRequest) => {
      const response = await createBranch(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["branches"] });
      toast.success(`El registro ${form.name} ha sido creado exitosamente.`);
      return response;
    },
    [client],
  );

  return <BranchForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
