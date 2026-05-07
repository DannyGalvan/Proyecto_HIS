import { z } from "zod";
import { invalid_type_error, MEDICO_ROL_ID } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";
import { isCuiValid } from "../utils/cuiValidator";

export const userSchema = z.object({
  id: z.number().nullable().optional(),
  rolId: z.union([
    z
      .string({
        error: invalid_type_error,
      })
      .min(1, "El Rol es requerido"),
    z.number().min(1, "El Rol es requerido"),
  ]),
  email: z
    .string()
    .min(1, "El Email es requerido")
    .email("El Email no es válido")
    .max(100, "El Email no puede exceder 100 caracteres"),
  name: z
    .string()
    .min(10, "El Nombre debe tener al menos 10 caracteres")
    .max(100, "El Nombre no puede exceder 100 caracteres"),
  userName: z
    .string()
    .min(8, "El Nombre de Usuario debe tener entre 8 y 9 caracteres")
    .max(9, "El Nombre de Usuario debe tener entre 8 y 9 caracteres"),
  password: z
    .string()
    .min(12, "La Contraseña debe tener al menos 12 caracteres")
    .max(100, "La Contraseña no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  identificationDocument: z
    .string()
    .regex(/^\d{13}$/, "El DPI debe tener exactamente 13 dígitos numéricos")
    .refine(
      isCuiValid,
      "El número de DPI/CUI no es válido. Verifique que los dígitos sean correctos.",
    )
    .optional()
    .or(z.literal("")),
  number: z
    .string()
    .regex(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos")
    .optional()
    .or(z.literal("")),
  nit: z
    .string()
    .min(8, "El NIT debe tener entre 8 y 9 caracteres")
    .max(9, "El NIT debe tener entre 8 y 9 caracteres")
    .optional()
    .or(z.literal("")),
  branchId: z
    .union([z.string({ error: invalid_type_error }), z.number()])
    .optional()
    .nullable(),
  specialtyId: z
    .union([z.string({ error: invalid_type_error }), z.number()])
    .optional()
    .nullable(),
  insuranceNumber: z
    .string()
    .min(5, "El número de seguro debe tener entre 5 y 50 caracteres")
    .max(50, "El número de seguro no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")),
  state: z.union([
    z
      .string({
        error: invalid_type_error,
      })
      .min(0)
      .max(1, "El Estado debe ser 0 (Inactivo) o 1 (Activo)"),
    z.number().min(0).max(1, "El Estado debe ser 0 (Inactivo) o 1 (Activo)"),
  ]),
});

export type UserValidation = z.infer<typeof userSchema>;

const isEmptyValue = (v: unknown): boolean =>
  v === null || v === undefined || v === "" || v === 0 || v === "0";

export const validateUser = (data: unknown) => {
  const result = userSchema.safeParse(data);
  let errors: ErrorObject = {};

  if (!result.success) {
    errors = handleOneLevelZodError(result.error);
  }

  // Regla condicional: la especialidad es obligatoria solo cuando el rol es Médico.
  // Para el resto de roles, specialtyId puede ser null/vacío.
  const obj = (data ?? {}) as { rolId?: unknown; specialtyId?: unknown };
  const rolIdNum = Number(obj.rolId);
  if (rolIdNum === MEDICO_ROL_ID && isEmptyValue(obj.specialtyId)) {
    errors = {
      ...errors,
      specialtyId:
        "La especialidad es requerida para usuarios con rol Médico",
    };
  }

  return errors;
};
