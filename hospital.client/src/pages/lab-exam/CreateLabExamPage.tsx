import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { LabExamForm } from "../../components/form/LabExamForm";
import { createLabExam } from "../../services/labExamService";
import type { LabExamRequest } from "../../types/LabExamResponse";

export function CreateLabExamPage() {
  const client = useQueryClient();

  const initialData: LabExamRequest = {
    name: "", description: "", defaultAmount: null, referenceRange: "",
    unit: "", laboratoryId: null, state: 1,
  };

  const onSubmit = useCallback(
    async (form: LabExamRequest) => {
      const response = await createLabExam(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["lab-exams"] });
      toast.success("Examen creado correctamente");
      return response;
    },
    [client],
  );

  return <LabExamForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
