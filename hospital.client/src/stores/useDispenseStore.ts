import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface DispenseFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useDispenseStore = create<DispenseFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
