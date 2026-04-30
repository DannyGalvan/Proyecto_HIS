interface StatCardProps {
  readonly icon: string;
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm flex items-center gap-4 ${color}`}
    >
      <div className="text-3xl">
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}
