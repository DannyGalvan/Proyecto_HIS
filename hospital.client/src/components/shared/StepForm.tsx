import type { ReactNode } from 'react';

interface StepFormProps {
  /** Labels for each step */
  readonly steps: string[];
  /** Zero-based index of the current step */
  readonly currentStep: number;
  readonly onNext: () => void;
  readonly onBack: () => void;
  readonly children: ReactNode;
}

/**
 * Multi-step form wrapper that renders a step indicator bar and
 * Back / Next navigation buttons.
 */
export function StepForm({ steps, currentStep, onNext, onBack, children }: StepFormProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Step labels */}
      <div className="flex justify-between text-xs font-medium text-gray-500">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`flex-1 text-center ${
              index === currentStep
                ? 'text-blue-600 font-semibold'
                : index < currentStep
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Step indicator dots */}
      <div className="relative flex items-center">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200" />
        <div
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-blue-500 transition-all duration-300"
          style={{
            width:
              steps.length > 1
                ? `${(currentStep / (steps.length - 1)) * 100}%`
                : '0%',
          }}
        />

        {/* Dots */}
        <div className="relative flex w-full justify-between">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                index < currentStep
                  ? 'border-green-500 bg-green-500 text-white'
                  : index === currentStep
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}
              aria-current={index === currentStep ? 'step' : undefined}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div>{children}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between gap-4 pt-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={onBack}
          className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${
            isFirst
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Atrás
        </button>

        {!isLast && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}
