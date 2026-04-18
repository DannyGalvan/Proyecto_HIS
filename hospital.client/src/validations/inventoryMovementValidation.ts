import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

/**
 * Base schema shared by all movement types.
 * Type-specific refinements are applied in the validate function.
 */
export const inventoryMovementSchema = z.object({
  movementType: z.union([
    z.string({ error: invalid_type_error }).min(1, "Debe seleccionar el tipo de movimiento."),
    z.number().min(0, "Debe seleccionar el tipo de movimiento.").max(5, "Tipo de operación inválido"),
  ]),
  medicineId: z.union([
    z.string({ error: invalid_type_error }).min(1, "Debe seleccionar un medicamento."),
    z.number().min(1, "Debe seleccionar un medicamento."),
  ]),
  branchId: z.union([
    z.string({ error: invalid_type_error }).min(1, "Debe seleccionar una sucursal."),
    z.number().min(1, "Debe seleccionar una sucursal."),
  ]),
  quantity: z.union([
    z
      .string({ error: invalid_type_error })
      .min(1, "La cantidad es obligatoria")
      .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, "La cantidad debe ser un número entero positivo."),
    z.number().int("La cantidad debe ser un número entero positivo.").min(1, "La cantidad debe ser un número entero positivo."),
  ]),
});

export const validateInventoryMovement = (data: unknown): ErrorObject => {
  const result = inventoryMovementSchema.safeParse(data);
  const errors: ErrorObject = result.success ? {} : handleOneLevelZodError(result.error);

  const record = data as Record<string, unknown>;
  const movementType = Number(record.movementType ?? -1);

  // Compra (0): unitCost is required and must be > 0
  if (movementType === 0) {
    const cost = Number(record.unitCost);
    if (!record.unitCost && record.unitCost !== 0) {
      errors.unitCost = "El costo unitario es obligatorio para compras";
    } else if (isNaN(cost) || cost <= 0) {
      errors.unitCost = "El costo unitario debe ser mayor a 0";
    } else {
      // Validate max 2 decimal places
      const parts = String(record.unitCost).split(".");
      if (parts[1] && parts[1].length > 2) {
        errors.unitCost = "El costo unitario debe tener máximo 2 decimales";
      }
    }
  }

  // Ajuste+ (4) and Ajuste- (5): Notes is mandatory with min 10 chars
  if (movementType === 4 || movementType === 5) {
    const notes = String(record.notes ?? "").trim();
    if (notes.length < 10) {
      errors.notes = "El motivo debe contener entre 10 y 1000 caracteres.";
    }
  }

  return errors;
};
