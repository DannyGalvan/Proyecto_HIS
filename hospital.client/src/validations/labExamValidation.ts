import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const labExamSchema = z.object({
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
  defaultAmount: z.union([
    z.string({ error: invalid_type_error }).min(1, "El precio base es obligatorio"),
    z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  ]),
  referenceRange: z.string().optional().or(z.literal("")),
  unit: z.string().optional().or(z.literal("")),
  laboratoryId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El laboratorio es obligatorio"),
    z.number().min(1, "El laboratorio es obligatorio"),
  ]),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateLabExam = (data: unknown): ErrorObject => {
  const result = labExamSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
