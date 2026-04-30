import { Button } from "@heroui/react";
import { Icon } from "../icons/Icon";

interface ConfirmDialogBodyProps {
  readonly message: string;
  readonly confirmText: string;
  readonly cancelText: string;
  readonly isLoading: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export function ConfirmDialogBody({
  message,
  confirmText,
  cancelText,
  isLoading,
  onClose,
  onConfirm,
}: ConfirmDialogBodyProps) {
  return (
    <>
      <div className="flex items-start gap-4 p-4">
        <div className="shrink-0">
          <Icon
            color="rgb(239, 68, 68)"
            name="bi bi-exclamation-triangle"
            size={30}
          />
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      </div>
      <div className="flex gap-2 justify-end w-full pt-2">
        <Button isDisabled={isLoading} variant="secondary" onPress={onClose}>
          {cancelText}
        </Button>
        <Button isPending={isLoading} variant="danger" onPress={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </>
  );
}

ConfirmDialogBody.displayName = "ConfirmDialogBody";
