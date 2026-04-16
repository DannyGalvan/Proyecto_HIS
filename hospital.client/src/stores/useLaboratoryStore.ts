import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface LaboratoryFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useLaboratoryStore = create<LaboratoryFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
