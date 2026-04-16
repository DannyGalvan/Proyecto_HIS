interface MedicineControlledBadgeProps {
  /** Whether the medicine is a controlled substance */
  readonly isControlled: boolean;
}

/**
 * Renders a warning badge when a medicine is classified as controlled.
 * Returns null when isControlled is false.
 */
export function MedicineControlledBadge({ isControlled }: MedicineControlledBadgeProps) {
  if (!isControlled) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 border border-orange-300">
      <span aria-hidden="true">⚠️</span>
      Controlado
    </span>
  );
}
