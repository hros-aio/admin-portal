import { create } from "zustand";

// Temporary placeholder until the backend OpenAPI spec is available.
// Replace with `components["schemas"]["AdminProfile"]` after running `pnpm openapi:types`.
type AdminProfile = Record<string, unknown>;

interface AuthState {
  accessToken: string | null;
  admin: AdminProfile | null;
  status: "idle" | "authenticated" | "unauthenticated" | "mfa_required";
  mfaToken: string | null;
  setSession: (token: string, admin: AdminProfile) => void;
  setMfaRequired: (mfaToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  admin: null,
  status: "idle",
  mfaToken: null,
  setSession: (accessToken, admin) => {
    set({ accessToken, admin, status: "authenticated", mfaToken: null });
  },
  setMfaRequired: (mfaToken) => {
    set({ status: "mfa_required", mfaToken });
  },
  clearSession: () => {
    set({ accessToken: null, admin: null, status: "unauthenticated", mfaToken: null });
  },
}));
