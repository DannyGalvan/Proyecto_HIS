import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const vitalSignSchema = z.object({
  id: z.number().nullable().optional(),
  appointmentId: z.union([
    z.string({ error: invalid_type_error }).min(1, "La cita es obligatoria"),
    z.number().min(1, "La cita es obligatoria"),
  ]),
  nurseId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El enfermero/a es obligatorio"),
    z.number().min(1, "El enfermero/a es obligatorio"),
  ]),
  bloodPressureSystolic: z.union([
    z.string({ error: invalid_type_error }).min(1, "La presión sistólica es obligatoria"),
    z.number().min(60, "Mínimo 60 mmHg").max(250, "Máximo 250 mmHg"),
  ]),
  bloodPressureDiastolic: z.union([
    z.string({ error: invalid_type_error }).min(1, "La presión diastólica es obligatoria"),
    z.number().min(40, "Mínimo 40 mmHg").max(150, "Máximo 150 mmHg"),
  ]),
  temperature: z.union([
    z.string({ error: invalid_type_error }).min(1, "La temperatura es obligatoria"),
    z.number().min(34, "Mínimo 34.0 °C").max(42, "Máximo 42.0 °C"),
  ]),
  weight: z.union([
    z.string({ error: invalid_type_error }).min(1, "El peso es obligatorio"),
    z.number().min(0.5, "Mínimo 0.5 kg").max(300, "Máximo 300 kg"),
  ]),
  height: z.union([
    z.string({ error: invalid_type_error }).min(1, "La altura es obligatoria"),
    z.number().min(30, "Mínimo 30 cm").max(250, "Máximo 250 cm"),
  ]),
  heartRate: z.union([
    z.string({ error: invalid_type_error }).min(1, "La frecuencia cardíaca es obligatoria"),
    z.number().min(30, "Mínimo 30 bpm").max(220, "Máximo 220 bpm"),
  ]),
  isEmergency: z.boolean().optional(),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateVitalSign = (data: unknown): ErrorObject => {
  const result = vitalSignSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
