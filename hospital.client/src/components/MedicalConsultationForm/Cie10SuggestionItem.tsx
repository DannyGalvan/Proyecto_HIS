import { useCallback } from "react";

interface Cie10SuggestionItemProps {
  readonly code: string;
  readonly description: string;
  readonly onSelect: (code: string, description: string) => void;
}

export function Cie10SuggestionItem({
  code,
  description,
  onSelect,
}: Cie10SuggestionItemProps) {
  const handleMouseDown = useCallback(
    () => onSelect(code, description),
    [code, description, onSelect],
  );

  return (
    <li
      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
      onMouseDown={handleMouseDown}
    >
      <span className="font-mono font-semibold text-blue-700">{code}</span>
      {" — "}
      <span className="text-gray-700">{description}</span>
    </li>
  );
}
