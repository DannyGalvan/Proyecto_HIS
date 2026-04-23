import { useCallback } from "react";
import type { BranchResponse } from "../../types/BranchResponse";

function BranchCard({
  branch,
  onSelect,
}: {
  readonly branch: BranchResponse;
  readonly onSelect: (branch: BranchResponse) => void;
}) {
  const handleSelect = useCallback(() => {
    onSelect(branch);
  }, [onSelect, branch]);

  return (
    <button
      key={branch.id}
      className="flex items-start gap-4 rounded-xl border border-gray-200 p-5 text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500"
      type="button"
      onClick={handleSelect}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        <i className="bi bi-building text-2xl text-blue-600 dark:text-blue-300" />
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100">
          {branch.name}
        </p>
        {branch.address ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            <i className="bi bi-geo-alt mr-1" />
            {branch.address}
          </p>
        ) : null}
        {branch.phone ? (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            <i className="bi bi-telephone mr-1" />
            {branch.phone}
          </p>
        ) : null}
      </div>
      <i className="bi bi-chevron-right ml-auto self-center text-gray-400" />
    </button>
  );
}

export default BranchCard;
