import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const medicineInventorySchema = z.object({
  id: z.number().nullable().optional(),
  medicineId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El medicamento es obligatorio"),
    z.number().min(1, "El medicamento es obligatorio"),
  ]),
  branchId: z.union([
    z.string({ error: invalid_type_error }).min(1, "La sucursal es obligatoria"),
    z.number().min(1, "La sucursal es obligatoria"),
  ]),
  currentStock: z.union([
    z.string({ error: invalid_type_error }).min(1, "El stock actual es obligatorio"),
    z.number().min(0, "El stock no puede ser negativo"),
  ]),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateMedicineInventory = (data: unknown): ErrorObject => {
  const result = medicineInventorySchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
