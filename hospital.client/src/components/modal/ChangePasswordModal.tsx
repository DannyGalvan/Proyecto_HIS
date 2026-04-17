import { Modal } from "@heroui/react";

import { ChangePasswordForm } from "../form/ChangePasswordForm";

interface ChangePasswordModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/**
 * Reusable modal for changing the authenticated user's password.
 * Can be opened from the portal profile page or the admin panel user menu.
 *
 * Usage:
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * <ChangePasswordModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 */
export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-md w-full">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Cambiar Contraseña</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="p-4">
                <ChangePasswordForm onSuccess={onClose} />
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
