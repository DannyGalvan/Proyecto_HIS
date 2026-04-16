import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const appointmentSchema = z.object({
  id: z.number().nullable().optional(),
  patientId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El paciente es obligatorio"),
    z.number().min(1, "El paciente es obligatorio"),
  ]),
  doctorId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El médico es obligatorio"),
    z.number().min(1, "El médico es obligatorio"),
  ]),
  specialtyId: z.union([
    z.string({ error: invalid_type_error }).min(1, "La especialidad es obligatoria"),
    z.number().min(1, "La especialidad es obligatoria"),
  ]),
  branchId: z.union([
    z.string({ error: invalid_type_error }).min(1, "La sucursal es obligatoria"),
    z.number().min(1, "La sucursal es obligatoria"),
  ]),
  appointmentStatusId: z.union([
    z.string({ error: invalid_type_error }).min(1, "El estado es obligatorio"),
    z.number().min(1, "El estado es obligatorio"),
  ]),
  appointmentDate: z.string().min(1, "La fecha de la cita es obligatoria"),
  reason: z
    .string()
    .min(10, "El motivo debe tener al menos 10 caracteres")
    .max(2000, "El motivo no debe exceder 2000 caracteres"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validateAppointment = (data: unknown): ErrorObject => {
  const result = appointmentSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
