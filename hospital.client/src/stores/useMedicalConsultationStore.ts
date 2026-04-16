import { create } from "zustand";
import type { ListFilter } from "../types/ListFilter";

interface MedicalConsultationFilterState {
  filters: ListFilter;
  setFilters: (filters: ListFilter) => void;
}

export const useMedicalConsultationStore = create<MedicalConsultationFilterState>((set) => ({
  filters: { filter: "", page: 1, pageSize: 10 },
  setFilters: (filters) => set({ filters }),
}));
