import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface NotificationLogFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useNotificationLogStore = create<NotificationLogFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
