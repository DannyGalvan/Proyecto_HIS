import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const medicineSchema = z.object({
  id: z.number().nullable().optional(),
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre no debe exceder 200 caracteres"),
  description: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(500, "La descripción no debe exceder 500 caracteres"),
  defaultPrice: z.union([
    z.string({ error: invalid_type_error }).min(1, "El precio es obligatorio"),
    z.number().min(0, "El precio debe ser mayor o igual a 0"),
  ]),
  unit: z.string().min(1, "La unidad es obligatoria"),
  isControlled: z.boolean().optional(),
  minimumStock: z.union([
    z.string({ error: invalid_type_error }),
    z.number().min(0, "El stock mínimo debe ser mayor o igual a 0"),
  ]).optional(),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateMedicine = (data: unknown): ErrorObject => {
  const result = medicineSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
