export function SummaryRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-medium text-gray-600 min-w-30">{label}:</span>
      <span className="text-gray-800">{value || "—"}</span>
    </div>
  );
}
