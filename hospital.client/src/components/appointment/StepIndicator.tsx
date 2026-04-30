interface StepIndicatorProps {
  readonly current: number;
  readonly total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isDone
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {isDone ? <i className="bi bi-check-lg" /> : step}
            </div>
            {step < total && (
              <div
                className={`h-0.5 w-8 ${isDone ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
