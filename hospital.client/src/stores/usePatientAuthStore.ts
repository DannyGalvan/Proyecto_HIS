import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { setAuthorization } from '../configs/axios/interceptors';
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
      signInPatient: (state: PatientAuthState) => {
        set({ ...state });
        setAuthorization(state.token);
      },
      logoutPatient: () => {
        set({ ...initialState });
        setAuthorization('');
      },
      syncPatientAuth: () => {
        // The persist middleware rehydrates state on app init.
        // This method re-applies the token to the axios instance
        // in case the interceptor default header needs refreshing.
        const stored = window.localStorage.getItem('@patient-auth');
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as { state?: PatientAuthState };
            const patientState = parsed?.state;
            if (patientState?.token) {
              set({ ...patientState });
              setAuthorization(patientState.token);
            }
          } catch {
            // Ignore malformed storage
          }
        }
      },
    }),
    {
      name: '@patient-auth',
      onRehydrateStorage: () => (state) => {
        // Called automatically by zustand/persist after rehydration from localStorage.
        // Re-apply the token to the axios default headers so requests made
        // immediately after a page reload carry the Authorization header.
        if (state?.token) {
          setAuthorization(state.token);
        }
      },
    }
  )
);
