import { beforeEach, describe, expect, it } from "vitest";

import type { ListFilter } from "../../types/ListFilter";
import { useAppointmentStore } from "../useAppointmentStore";

describe("useAppointmentStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppointmentStore.setState({
      filters: { filter: "", page: 1, pageSize: 10 },
    });
  });

  describe("initial state", () => {
    it("should have default filters with empty filter, page 1, and pageSize 10", () => {
      const state = useAppointmentStore.getState();
      expect(state.filters.filter).toBe("");
      expect(state.filters.page).toBe(1);
      expect(state.filters.pageSize).toBe(10);
    });
  });

  describe("setFilters", () => {
    it("should update filters state with provided filter, page, and pageSize", () => {
      const newFilters: ListFilter = {
        filter: "Status:eq:Confirmed",
        page: 3,
        pageSize: 25,
      };

      useAppointmentStore.getState().setFilters(newFilters);

      const state = useAppointmentStore.getState();
      expect(state.filters.filter).toBe("Status:eq:Confirmed");
      expect(state.filters.page).toBe(3);
      expect(state.filters.pageSize).toBe(25);
    });

    it("should replace previous filters entirely", () => {
      useAppointmentStore.getState().setFilters({
        filter: "DoctorId:eq:5",
        page: 2,
        pageSize: 20,
      });

      useAppointmentStore.getState().setFilters({
        filter: "PatientId:eq:10",
        page: 1,
        pageSize: 50,
      });

      const state = useAppointmentStore.getState();
      expect(state.filters.filter).toBe("PatientId:eq:10");
      expect(state.filters.page).toBe(1);
      expect(state.filters.pageSize).toBe(50);
    });

    it("should handle filters with undefined filter string", () => {
      const newFilters: ListFilter = {
        page: 5,
        pageSize: 15,
      };

      useAppointmentStore.getState().setFilters(newFilters);

      const state = useAppointmentStore.getState();
      expect(state.filters.filter).toBeUndefined();
      expect(state.filters.page).toBe(5);
      expect(state.filters.pageSize).toBe(15);
    });
  });
});
