import { create } from 'zustand';

import { setAuthorization } from '../configs/axios/interceptors';
import type { PatientAuthState } from '../types/PatientPortalTypes';

const STORAGE_KEY = '@patient-auth';

interface PatientAuthStore {
  /** Current auth state */
  isLoggedIn: boolean;
  token: string;
  userId: number;
  name: string;
  email: string;
  userName: string;
  /** Whether the store has finished loading from localStorage */
  loading: boolean;
  /** Read stored state from localStorage and apply it */
  syncPatientAuth: () => void;
  /** Save auth state after login */
  signInPatient: (state: PatientAuthState) => void;
  /** Clear auth state on logout */
  logoutPatient: () => void;
}

const initialState: PatientAuthState = {
  isLoggedIn: false,
  token: '',
  userId: 0,
  name: '',
  email: '',
  userName: '',
};

export const usePatientAuthStore = create<PatientAuthStore>((set) => ({
  ...initialState,
  loading: true,

  syncPatientAuth: () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PatientAuthState = JSON.parse(stored);
        if (parsed?.token && parsed?.isLoggedIn) {
          set({ ...parsed, loading: false });
          setAuthorization(parsed.token);
          return;
        }
      }
    } catch {
      // Ignore malformed storage
    }
    set({ ...initialState, loading: false });
  },

  signInPatient: (state: PatientAuthState) => {
    set({ ...state, loading: false });
    setAuthorization(state.token);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  logoutPatient: () => {
    set({ ...initialState, loading: false });
    setAuthorization('');
    window.localStorage.removeItem(STORAGE_KEY);
  },
}));
