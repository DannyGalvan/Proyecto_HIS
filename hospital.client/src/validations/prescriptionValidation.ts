import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const prescriptionSchema = z.object({
  id: z.number().nullable().optional(),
  consultationId: z.union([
    z.string({ error: invalid_type_error }).min(1, "La consulta es obligatoria"),
    z.number().min(1, "La consulta es obligatoria"),
  ]),
  doctorId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El médico es obligatorio"),
    z.number().min(1, "El médico es obligatorio"),
  ]),
  prescriptionDate: z.string().min(1, "La fecha de la receta es obligatoria"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const prescriptionItemSchema = z.object({
  id: z.number().nullable().optional(),
  prescriptionId: z.union([
    z.string({ error: invalid_type_error }).min(1, "La receta es obligatoria"),
    z.number().min(1, "La receta es obligatoria"),
  ]),
  medicineName: z
    .string()
    .min(1, "El nombre del medicamento es obligatorio")
    .max(200, "No debe exceder 200 caracteres"),
  dosage: z.string().min(1, "La dosis es obligatoria"),
  frequency: z.string().min(1, "La frecuencia es obligatoria"),
  duration: z.string().min(1, "La duración es obligatoria"),
  specialInstructions: z.string().optional().or(z.literal("")),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validatePrescription = (data: unknown): ErrorObject => {
  const result = prescriptionSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};

export const validatePrescriptionItem = (data: unknown): ErrorObject => {
  const result = prescriptionItemSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
