import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const branchSchema = z.object({
  id: z.number().nullable().optional(),
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no debe exceder 100 caracteres"),
  phone: z
    .string()
    .regex(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "La dirección no debe exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(250, "La descripción no debe exceder 250 caracteres")
    .optional()
    .or(z.literal("")),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateBranch = (data: unknown): ErrorObject => {
  const result = branchSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
