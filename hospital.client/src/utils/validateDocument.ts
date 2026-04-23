// ─── Document validation helper ──────────────────────────────────────────────

export const validateDocument = (file: File): string | null => {
  if (file.type !== "application/pdf") return "Solo se permiten archivos PDF";
  if (file.size > 2097152) return "El archivo no puede superar 2MB";
  return null;
};
