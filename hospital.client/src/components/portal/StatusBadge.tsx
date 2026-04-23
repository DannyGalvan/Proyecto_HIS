// ── Status badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { readonly status: string }) {
  const map: Record<string, string> = {
    "Pendiente de Pago": "bg-yellow-100 text-yellow-800",
    Confirmada: "bg-green-100 text-green-800",
    "Signos Vitales": "bg-purple-100 text-purple-800",
    "En Espera": "bg-orange-100 text-orange-800",
    "Consulta Médica": "bg-blue-100 text-blue-800",
    Evaluado: "bg-teal-100 text-teal-800",
    Laboratorio: "bg-indigo-100 text-indigo-800",
    Farmacia: "bg-cyan-100 text-cyan-800",
    "Atención Finalizada": "bg-gray-100 text-gray-700",
    "No Asistió": "bg-red-100 text-red-800",
    Cancelada: "bg-red-100 text-red-800",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}
