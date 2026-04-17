import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface BranchSpecialtyFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useBranchSpecialtyStore = create<BranchSpecialtyFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
