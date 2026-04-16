import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface MedicineFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useMedicineStore = create<MedicineFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
