import { z } from "zod";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

/** Helper: accepts string or number, coerces to number, then validates range */
const numericRange = (
  fieldName: string,
  min: number,
  max: number,
  unit: string,
) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .pipe(
      z
        .number({ error: `${fieldName} debe ser un número` })
        .refine((v) => !isNaN(v), { message: `${fieldName} es obligatorio` })
        .refine((v) => v >= min, {
          message: `${fieldName} debe ser al menos ${min} ${unit}`,
        })
        .refine((v) => v <= max, {
          message: `${fieldName} no puede exceder ${max} ${unit}`,
        }),
    );

const requiredId = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === "string" ? Number(val) : val))
  .pipe(z.number().min(1, "Este campo es obligatorio"));

export const vitalSignSchema = z.object({
  id: z.number().nullable().optional(),
  appointmentId: requiredId,
  nurseId: requiredId,
  bloodPressureSystolic: numericRange(
    "La presión sistólica",
    60,
    250,
    "mmHg",
  ),
  bloodPressureDiastolic: numericRange(
    "La presión diastólica",
    40,
    150,
    "mmHg",
  ),
  temperature: numericRange("La temperatura", 34, 42, "°C"),
  weight: numericRange("El peso", 0.5, 300, "kg"),
  height: numericRange("La altura", 30, 250, "cm"),
  heartRate: numericRange("La frecuencia cardíaca", 30, 220, "bpm"),
  isEmergency: z.boolean().optional(),
  state: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .pipe(z.number().min(0).max(1)),
});

export const validateVitalSign = (data: unknown): ErrorObject => {
  const result = vitalSignSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
