import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface MedicineInventoryFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useMedicineInventoryStore = create<MedicineInventoryFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
