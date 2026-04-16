import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface VitalSignFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useVitalSignStore = create<VitalSignFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
