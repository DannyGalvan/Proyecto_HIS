import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const laboratorySchema = z.object({
  id: z.number().nullable().optional(),
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre no debe exceder 200 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no debe exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateLaboratory = (data: unknown): ErrorObject => {
  const result = laboratorySchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
