import z from "zod";

// ── Zod schema ────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  name: z
    .string()
    .min(10, "El nombre debe tener al menos 10 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido"),
  number: z
    .string()
    .regex(
      /^\d{8}$/,
      "El teléfono debe contener exactamente 8 dígitos numéricos",
    ),
  nit: z.string().optional().or(z.literal("")),
  insuranceNumber: z.string().optional().or(z.literal("")),
});
