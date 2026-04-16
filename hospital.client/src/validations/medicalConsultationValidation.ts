import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const medicalConsultationSchema = z.object({
  id: z.number().nullable().optional(),
  appointmentId: z.union([
    z.string({ error: invalid_type_error }).min(1, "La cita es obligatoria"),
    z.number().min(1, "La cita es obligatoria"),
  ]),
  doctorId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El médico es obligatorio"),
    z.number().min(1, "El médico es obligatorio"),
  ]),
  reasonForVisit: z
    .string()
    .min(1, "El motivo de visita es obligatorio"),
  clinicalFindings: z.string().optional().or(z.literal("")),
  diagnosis: z
    .string()
    .min(10, "El diagnóstico debe tener al menos 10 caracteres")
    .max(5000, "El diagnóstico no debe exceder 5000 caracteres")
    .optional()
    .or(z.literal("")),
  diagnosisCie10Code: z.string().optional().or(z.literal("")),
  treatmentPlan: z.string().optional().or(z.literal("")),
  consultationStatus: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
  notes: z.string().optional().or(z.literal("")),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateMedicalConsultation = (data: unknown): ErrorObject => {
  const result = medicalConsultationSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
