import { useCallback } from "react";

interface SlotButtonProps {
  readonly slot: Date;
  readonly time: string;
  readonly disabled: boolean;
  readonly isSelected: boolean;
  readonly isLockedByOther: boolean;
  readonly isPast: boolean;
  readonly occupied: boolean;
  readonly isConfirmed: boolean;
  readonly onSlotClick: (slot: Date) => void;
}

export function SlotButton({
  slot,
  time,
  disabled,
  isSelected,
  isLockedByOther,
  isPast,
  occupied,
  isConfirmed,
  onSlotClick,
}: SlotButtonProps) {
  const handleClick = useCallback(
    () => void onSlotClick(slot),
    [slot, onSlotClick],
  );

  let buttonClass =
    "rounded px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ";

  if (isSelected) {
    buttonClass += "bg-blue-600 text-white focus:ring-blue-500";
  } else if (isLockedByOther) {
    buttonClass += "cursor-not-allowed bg-amber-100 text-amber-600";
  } else if (isPast || occupied || isConfirmed) {
    buttonClass += "cursor-not-allowed bg-gray-100 text-gray-400";
  } else {
    buttonClass +=
      "bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500";
  }

  return (
    <button
      aria-label={`Slot ${time}${
        isLockedByOther
          ? " - reservado temporalmente por otro paciente"
          : occupied || isConfirmed
            ? " - ocupado"
            : isPast
              ? " - pasado"
              : " - disponible"
      }`}
      aria-pressed={isSelected}
      className={buttonClass}
      disabled={disabled}
      title={
        isLockedByOther
          ? "Reservado temporalmente por otro paciente"
          : undefined
      }
      type="button"
      onClick={handleClick}
    >
      {time}
      {isLockedByOther ? (
        <span className="sr-only">
          Reservado temporalmente por otro paciente
        </span>
      ) : null}
    </button>
  );
}
