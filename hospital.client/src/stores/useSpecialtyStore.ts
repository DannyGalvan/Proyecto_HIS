import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface SpecialtyFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useSpecialtyStore = create<SpecialtyFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
