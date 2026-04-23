// ── Tarjeta de sucursal ───────────────────────────────────────────────────────
export function BranchPortalCard({
  branch,
}: {
  readonly branch: {
    id: number;
    name: string;
    address?: string | null;
    phone?: string | null;
    description?: string | null;
  };
}) {
  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
          <i className="bi bi-geo-alt-fill text-xl text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
            {branch.name}
          </h3>
          {branch.address ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <i className="bi bi-map" /> {branch.address}
            </p>
          ) : null}
          {branch.phone ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <i className="bi bi-telephone" /> {branch.phone}
            </p>
          ) : null}
          {branch.description ? (
            <p className="text-sm text-gray-400 mt-2">{branch.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
