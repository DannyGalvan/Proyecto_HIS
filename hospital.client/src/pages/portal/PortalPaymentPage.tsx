import { useLocation, useNavigate } from "react-router";

import { PortalPaymentContent } from "../../components/portal/PortalPaymentContent";
import { nameRoutes } from "../../configs/constants";

// ── Navigation state shape ────────────────────────────────────────────────────
interface PaymentLocationState {
  appointmentId: number;
  createdAt: string;
  doctorName: string;
  specialtyName: string;
  branchName: string;
  appointmentDate: string;
  amount: number;
}

// ── Page ──────────────────────────────────────────────────────────────────────
// Note: named PortalPaymentPage to avoid collision with admin PaymentPage
export function Component() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as PaymentLocationState | null;

  // If no navigation state, redirect to booking
  if (!state) {
    navigate(nameRoutes.portalBook, { replace: true });
    return null;
  }

  const {
    appointmentId,
    createdAt,
    doctorName,
    specialtyName,
    branchName,
    appointmentDate,
    amount,
  } = state;

  return (
    <PortalPaymentContent
      amount={amount}
      appointmentDate={appointmentDate}
      appointmentId={appointmentId}
      branchName={branchName}
      createdAt={createdAt}
      doctorName={doctorName}
      specialtyName={specialtyName}
    />
  );
}

Component.displayName = "PortalPaymentPage";
