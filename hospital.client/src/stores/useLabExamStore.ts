import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface LabExamFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useLabExamStore = create<LabExamFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
