// ── Tarjeta de especialidad ───────────────────────────────────────────────────
export function SpecialtyPortalCard({
  specialty,
}: {
  readonly specialty: { id: number; name: string; description?: string | null };
}) {
  const icons: Record<string, string> = {
    Cardiología: "bi-heart-pulse",
    Pediatría: "bi-person-hearts",
    Neurología: "bi-brain",
    Ortopedia: "bi-bandaid",
    Ginecología: "bi-gender-female",
    Dermatología: "bi-droplet",
    Oftalmología: "bi-eye",
    "Medicina General": "bi-clipboard2-pulse",
  };
  const icon = icons[specialty.name] ?? "bi-hospital";

  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        <i className={`bi ${icon} text-2xl text-blue-600 dark:text-blue-400`} />
      </div>
      <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
        {specialty.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {specialty.description}
      </p>
    </div>
  );
}
