import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { customRender } from "@/test-utils/render";
import { server } from "@/test-utils/server";

// Mock the payment store
vi.mock("@/stores/usePaymentStore", () => ({
  usePaymentStore: () => ({
    filters: { filter: "", page: 1, pageSize: 10 },
    setFilters: vi.fn(),
  }),
}));

// Mock the payment service
const mockGetPendingOrders = vi.fn();
const mockGetPayments = vi.fn();
vi.mock("@/services/paymentService", () => ({
  getPendingOrders: (...args: unknown[]) => mockGetPendingOrders(...args),
  getPayments: (...args: unknown[]) => mockGetPayments(...args),
  createPayment: vi.fn(),
}));

// Mock dispense and lab order services
vi.mock("@/services/dispenseService", () => ({
  partialUpdateDispense: vi.fn(),
}));
vi.mock("@/services/labOrderService", () => ({
  partialUpdateLabOrder: vi.fn(),
}));

// Import after mocks
import { PaymentPage } from "@/pages/payment/PaymentPage";

// ─── MSW lifecycle ───────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("PaymentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPayments.mockResolvedValue({
      success: true,
      data: [],
      totalResults: 0,
      message: "",
    });
  });

  it("renders pending order with formatted amount and enabled Cobrar button", async () => {
    const user = userEvent.setup();

    mockGetPendingOrders.mockResolvedValue({
      success: true,
      data: [
        {
          orderType: "LabOrder",
          orderId: 10,
          orderNumber: "LAB-001",
          patientName: "María García",
          patientDpi: "1234567890101",
          createdAt: "2024-06-15T10:00:00",
          itemCount: 3,
          totalAmount: 250.5,
          paymentType: 1,
        },
      ],
      totalResults: 1,
      message: "",
    });

    customRender(<PaymentPage />);

    // Verify the pending orders section title
    expect(screen.getByText("Órdenes Pendientes de Pago")).toBeInTheDocument();

    // Verify search input is present
    const searchInput = screen.getByPlaceholderText(
      "Ingrese DPI o número de orden...",
    );
    expect(searchInput).toBeInTheDocument();

    // Type a DPI and search
    await user.type(searchInput, "1234567890101");
    const searchButton = screen.getByText("Buscar");
    await user.click(searchButton);

    // Wait for the pending order to appear with formatted amount
    expect(await screen.findByText("María García")).toBeInTheDocument();
    expect(screen.getByText("LAB-001")).toBeInTheDocument();
    expect(screen.getByText("Q 250.50")).toBeInTheDocument();

    // Verify the "Cobrar" button is present and enabled
    const cobrarButton = screen.getByText("Cobrar");
    expect(cobrarButton).toBeInTheDocument();
    expect(cobrarButton.closest("button")).not.toBeDisabled();
  });
});
