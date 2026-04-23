import type { LabOrderItemRow } from "./LabOrderItemRowComponent";

export const newItemRow = (): LabOrderItemRow => ({
  id: crypto.randomUUID(),
  labExamId: null,
  examName: "",
  defaultAmount: null,
});
