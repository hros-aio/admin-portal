"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useToast } from "@/lib/toast";
import { userEvent } from "@/tests/test-utils";
import { useLogin } from "./use-login";

const push = vi.fn();
const toastError = vi.fn();
const mockLogin = vi.hoisted(() => vi.fn<typeof authService.login>());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    login: mockLogin,
  },
}));

vi.mock("@/lib/toast", () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: toastError,
  })),
}));

const mockUseToast = vi.mocked(useToast);

function LoginHarness({ onMfaRequired }: { onMfaRequired: (mfaToken: string) => void }) {
  const login = useLogin({ onMfaRequired });

  return (
    <button
      type="button"
      onClick={() => {
        login.mutate({
          email: "admin@example.com",
          password: "password",
          remember_me: false,
        });
      }}
    >
      Sign In
    </button>
  );
}

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("useLogin", () => {
  beforeEach(() => {
    push.mockReset();
    toastError.mockReset();
    mockUseToast.mockClear();
    mockLogin.mockReset();
    useAuthStore.getState().clearSession();
  });

  it("reports MFA challenge responses without storing a token or redirecting", async () => {
    const user = userEvent.setup();
    const onMfaRequired = vi.fn();
    mockLogin.mockResolvedValue({ mfa_required: true, mfa_token: "mfa-token" });

    renderWithQueryClient(<LoginHarness onMfaRequired={onMfaRequired} />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(onMfaRequired).toHaveBeenCalledWith("mfa-token");
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});
