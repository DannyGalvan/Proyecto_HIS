import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface AppointmentStatusFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useAppointmentStatusStore = create<AppointmentStatusFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
