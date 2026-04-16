import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface PaymentFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const usePaymentStore = create<PaymentFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
