// ---------------------------------------------------------------------------
// Zod schema (zod v4 uses `error` instead of `message`)

import z from "zod";
import { luhnCheck } from "../utils/luhn";

// ---------------------------------------------------------------------------
export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, {
      error: "El número de tarjeta debe tener entre 13 y 19 dígitos",
    })
    .refine(luhnCheck, { error: "El número de tarjeta no es válido" }),
  cardHolder: z
    .string()
    .min(5, { error: "El nombre del titular debe tener al menos 5 caracteres" })
    .max(100, {
      error: "El nombre del titular no puede exceder 100 caracteres",
    }),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { error: "Formato inválido. Use MM/AA" })
    .refine(
      (val) => {
        const [month, year] = val.split("/");
        const expDate = new Date(
          2000 + parseInt(year, 10),
          parseInt(month, 10) - 1,
        );
        return expDate > new Date();
      },
      { error: "La tarjeta está vencida" },
    ),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, { error: "El CVV debe tener 3 o 4 dígitos" }),
});
