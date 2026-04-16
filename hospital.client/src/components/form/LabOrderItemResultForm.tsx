import { Form, Input, Label, TextField } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState, type ChangeEvent } from "react";
import { AsyncButton } from "../button/AsyncButton";
import { OutOfRangeAlert } from "../shared/OutOfRangeAlert";
import { Response } from "../messages/Response";
import { partialUpdateLabOrderItem } from "../../services/labOrderService";
import type { LabOrderItemResponse } from "../../types/LabOrderItemResponse";

interface LabOrderItemResultFormProps {
  readonly item: LabOrderItemResponse;
  readonly onSuccess?: () => void;
}

interface ResultFormState {
  resultValue: string;
  resultUnit: string;
  isOutOfRange: boolean;
  resultNotes: string;
  resultDate: string;
}

export function LabOrderItemResultForm({ item, onSuccess }: LabOrderItemResultFormProps) {
  const [form, setForm] = useState<ResultFormState>({
    resultValue: item.resultValue ?? "",
    resultUnit: item.resultUnit ?? "",
    isOutOfRange: item.isOutOfRange ?? false,
    resultNotes: item.resultNotes ?? "",
    resultDate: item.resultDate ? item.resultDate.split("T")[0] : "",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }, []);

  const { mutateAsync: doUpdate, isPending } = useMutation({
    mutationFn: partialUpdateLabOrderItem,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(null);

      const response = await doUpdate({
        id: item.id,
        resultValue: form.resultValue || null,
        resultUnit: form.resultUnit || null,
        isOutOfRange: form.isOutOfRange,
        resultNotes: form.resultNotes || null,
        resultDate: form.resultDate || null,
      });

      if (response.success) {
        setSubmitSuccess("Resultado guardado exitosamente.");
        onSuccess?.();
      } else {
        setSubmitError(response.message ?? "Error al guardar el resultado.");
      }
    },
    [form, item.id, doUpdate, onSuccess],
  );

  return (
    <Form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      {submitError && <Response message={submitError} type={false} />}
      {submitSuccess && <Response message={submitSuccess} type={true} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField className="flex flex-col gap-1" name="resultValue">
          <Label className="font-bold text-sm">Valor del Resultado</Label>
          <Input
            className="px-3 py-2 border rounded-md"
            name="resultValue"
            type="text"
            value={form.resultValue}
            onChange={handleChange}
          />
        </TextField>

        <TextField className="flex flex-col gap-1" name="resultUnit">
          <Label className="font-bold text-sm">Unidad</Label>
          <Input
            className="px-3 py-2 border rounded-md"
            name="resultUnit"
            type="text"
            value={form.resultUnit}
            onChange={handleChange}
          />
        </TextField>

        <TextField className="flex flex-col gap-1" name="resultDate">
          <Label className="font-bold text-sm">Fecha del Resultado</Label>
          <Input
            className="px-3 py-2 border rounded-md"
            name="resultDate"
            type="date"
            value={form.resultDate}
            onChange={handleChange}
          />
        </TextField>

        <div className="flex items-center gap-3 self-end pb-2">
          <input
            checked={form.isOutOfRange}
            className="w-4 h-4 accent-red-600"
            id={`isOutOfRange-${item.id}`}
            name="isOutOfRange"
            type="checkbox"
            onChange={handleChange}
          />
          <label className="font-bold text-sm cursor-pointer" htmlFor={`isOutOfRange-${item.id}`}>
            Fuera de Rango
          </label>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="font-bold text-sm" htmlFor={`resultNotes-${item.id}`}>
            Notas del Resultado
          </label>
          <textarea
            className="px-3 py-2 border rounded-md resize-none"
            id={`resultNotes-${item.id}`}
            name="resultNotes"
            rows={2}
            value={form.resultNotes}
            onChange={handleChange}
          />
        </div>
      </div>

      {form.isOutOfRange && (
        <div className="mt-1">
          <OutOfRangeAlert
            isOutOfRange={form.isOutOfRange}
            referenceRange={item.referenceRange ?? undefined}
          />
        </div>
      )}

      <div className="flex justify-end mt-2">
        <AsyncButton
          className="font-bold"
          isLoading={isPending}
          loadingText="Guardando..."
          size="sm"
          type="submit"
          variant="primary"
        >
          <i className="bi bi-save mr-1" /> Guardar Resultado
        </AsyncButton>
      </div>
    </Form>
  );
}
