import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { PatientAuthState } from '../types/PatientPortalTypes';

interface PatientAuthStore extends PatientAuthState {
  signInPatient: (state: PatientAuthState) => void;
  logoutPatient: () => void;
  syncPatientAuth: () => void;
}

const initialState: PatientAuthState = {
  isLoggedIn: false,
  token: '',
  userId: 0,
  name: '',
  email: '',
  userName: '',
};

export const usePatientAuthStore = create<PatientAuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      signInPatient: (state: PatientAuthState) => set({ ...state }),
      logoutPatient: () => set({ ...initialState }),
      syncPatientAuth: () => {
        // Re-sync from localStorage if needed.
        // The persist middleware already rehydrates state on app init,
        // so this is a no-op hook for manual re-sync if required.
        const stored = window.localStorage.getItem('@patient-auth');
        if (stored) {
          try {
            const parsed: PatientAuthState = JSON.parse(stored);
            set({ ...parsed });
          } catch {
            // Ignore malformed storage
          }
        }
      },
    }),
    {
      name: '@patient-auth',
    }
  )
);
