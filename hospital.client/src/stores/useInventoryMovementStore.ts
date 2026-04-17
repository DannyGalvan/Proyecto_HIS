import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface InventoryMovementFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useInventoryMovementStore = create<InventoryMovementFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
