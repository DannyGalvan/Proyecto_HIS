import { z } from "zod";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";
import { da } from "zod/v4/locales";

export const registerSchema = z.object({
  name: z
    .string()
    .min(10, "El nombre debe tener entre 10 y 100 caracteres")
    .max(100, "El nombre debe tener entre 10 y 100 caracteres"),
  identificationDocument: z
    .string()
    .regex(/^\d{13}$/, "El DPI debe tener exactamente 13 dígitos numéricos"),
  userName: z
    .string()
    .min(8, "El usuario debe tener entre 8 y 9 caracteres")
    .max(9, "El usuario debe tener entre 8 y 9 caracteres"),
  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("El formato del correo no es válido. Ejemplo: usuario@dominio.com"),
  number: z
    .string()
    .regex(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos numéricos"),
  nit: z
    .string()
    .min(8, "El NIT debe tener entre 8 y 9 caracteres")
    .max(9, "El NIT debe tener entre 8 y 9 caracteres")
    .optional()
    .or(z.literal("")),
  insuranceNumber: z
    .string()
    .min(5, "El número de seguro debe tener entre 5 y 50 caracteres")
    .max(50, "El número de seguro debe tener entre 5 y 50 caracteres")
    .optional()
    .or(z.literal("")),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const validateRegister = (data: unknown): ErrorObject => {

  const result = registerSchema.safeParse(data);
  console.log(result)
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
