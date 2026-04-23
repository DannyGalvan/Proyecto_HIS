import { Button, Modal } from "@heroui/react";

import type { PendingOrderResponse } from "../../types/PendingOrderResponse";
import { AsyncButton } from "../button/AsyncButton";
import { PaymentModalBody } from "./PaymentModalBody";

function formatCurrency(amount: number): string {
  return `Q ${amount.toFixed(2)}`;
}

interface PaymentFormState {
  paymentMethod: "cash" | "card";
  amountReceived: string;
  cardLastFourDigits: string;
}

interface PaymentModalProps {
  readonly isOpen: boolean;
  readonly ordersToPayList: PendingOrderResponse[];
  readonly paymentForm: PaymentFormState;
  readonly paymentTotal: number;
  readonly changeAmount: number;
  readonly isProcessingPayment: boolean;
  readonly onClose: () => void;
  readonly onProcessPayment: () => void;
  readonly onSelectCash: () => void;
  readonly onSelectCard: () => void;
  readonly onAmountReceivedChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  readonly onCardDigitsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PaymentModal({
  isOpen,
  ordersToPayList,
  paymentForm,
  paymentTotal,
  changeAmount,
  isProcessingPayment,
  onClose,
  onProcessPayment,
  onSelectCash,
  onSelectCard,
  onAmountReceivedChange,
  onCardDigitsChange,
}: PaymentModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-lg w-full">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Procesar Pago</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <PaymentModalBody
                changeAmount={changeAmount}
                ordersToPayList={ordersToPayList}
                paymentForm={paymentForm}
                paymentTotal={paymentTotal}
                onAmountReceivedChange={onAmountReceivedChange}
                onCardDigitsChange={onCardDigitsChange}
                onSelectCard={onSelectCard}
                onSelectCash={onSelectCash}
              />
            </Modal.Body>
            <Modal.Footer className="flex gap-2 justify-end w-full">
              <Button
                isDisabled={isProcessingPayment}
                variant="secondary"
                onPress={onClose}
              >
                Cancelar
              </Button>
              <AsyncButton
                isLoading={isProcessingPayment}
                variant="primary"
                onPress={onProcessPayment}
              >
                Confirmar Pago ({formatCurrency(paymentTotal)})
              </AsyncButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
