import { useCallback } from "react";

interface PublishButtonProps {
  readonly itemId: number;
  readonly isPending: boolean;
  readonly onPublish: (id: number) => void;
}

export function PublishButton({
  itemId,
  isPending,
  onPublish,
}: PublishButtonProps) {
  const handleClick = useCallback(() => onPublish(itemId), [itemId, onPublish]);
  return (
    <button
      className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition-colors disabled:opacity-50"
      disabled={isPending}
      type="button"
      onClick={handleClick}
    >
      <i className="bi bi-send-check mr-1" /> Publicar resultado
    </button>
  );
}
