import { z } from "zod";
import { invalid_type_error } from "../configs/constants";
import type { ErrorObject } from "../hooks/useForm";
import { handleOneLevelZodError } from "../utils/converted";

export const paymentSchema = z.object({
  id: z.number().nullable().optional(),
  amount: z.union([
    z.string({ error: invalid_type_error }).min(1, "El monto es obligatorio"),
    z.number().min(0.01, "El monto debe ser mayor a 0"),
  ]),
  paymentMethod: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(3),
  ]),
  paymentType: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(2),
  ]),
  paymentStatus: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(3),
  ]),
  paymentDate: z.string().min(1, "La fecha de pago es obligatoria"),
  idempotencyKey: z.string().min(1, "La clave de idempotencia es obligatoria"),
  cardLastFourDigits: z
    .string()
    .regex(/^\d{4}$/, "Deben ser exactamente 4 dígitos")
    .optional()
    .or(z.literal("")),
  amountReceived: z.union([
    z.string({ error: invalid_type_error }),
    z.number().min(0),
  ]).optional(),
  state: z.union([
    z.string({ error: invalid_type_error }).min(0),
    z.number().min(0).max(1),
  ]),
});

export const validatePayment = (data: unknown): ErrorObject => {
  const result = paymentSchema.safeParse(data);
  if (!result.success) return handleOneLevelZodError(result.error);
  return {};
};
