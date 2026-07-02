import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setToken: (token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setToken: (accessToken) => {
    set({ accessToken });
  },
  clearSession: () => {
    set({ accessToken: null });
  },
}));
