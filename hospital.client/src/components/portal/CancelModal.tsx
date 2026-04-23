import { Button, Modal } from "@heroui/react";

import { CancelModalBody } from "./CancelModalBody";

interface CancelModalProps {
  readonly isOpen: boolean;
  readonly isPending: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export function CancelModal({
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: CancelModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-md w-full">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Cancelar Cita</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <CancelModalBody />
            </Modal.Body>
            <Modal.Footer className="flex gap-2 justify-end w-full">
              <Button
                isDisabled={isPending}
                variant="secondary"
                onPress={onClose}
              >
                No, mantener cita
              </Button>
              <Button
                isPending={isPending}
                variant="danger"
                onPress={onConfirm}
              >
                Sí, cancelar cita
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
