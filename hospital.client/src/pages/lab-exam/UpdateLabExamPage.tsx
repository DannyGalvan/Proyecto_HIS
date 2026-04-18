import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { LabExamForm } from "../../components/form/LabExamForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getLabExamById, updateLabExam } from "../../services/labExamService";
import type { LabExamRequest } from "../../types/LabExamResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateLabExamPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["labExamToUpdate", id],
    queryFn: () => getLabExamById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: LabExamRequest) => {
      const response = await updateLabExam(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["lab-exams"] });
      await client.invalidateQueries({ queryKey: ["labExamToUpdate", id] });
      toast.success(`El registro ${form.name} ha sido actualizado correctamente.`);
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <LabExamForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
