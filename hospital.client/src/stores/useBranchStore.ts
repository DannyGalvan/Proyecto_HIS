import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface BranchFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useBranchStore = create<BranchFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
