import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface PrescriptionFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const usePrescriptionStore = create<PrescriptionFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
