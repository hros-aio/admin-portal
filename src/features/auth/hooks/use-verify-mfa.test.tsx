"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";
import { userEvent } from "@/tests/test-utils";
import { useVerifyMfa } from "./use-verify-mfa";

const push = vi.fn();
const toastError = vi.fn();
const mockVerifyMfa = vi.hoisted(() => vi.fn<typeof authService.verifyMfa>());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    verifyMfa: mockVerifyMfa,
  },
}));

vi.mock("@/lib/toast", () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: toastError,
  })),
}));

const mockUseToast = vi.mocked(useToast);

function VerifyMfaHarness() {
  const verifyMfa = useVerifyMfa();

  return (
    <button
      type="button"
      onClick={() => {
        verifyMfa.mutate({ mfa_token: "mfa-token", code: "123456" });
      }}
    >
      Verify MFA
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

describe("useVerifyMfa", () => {
  beforeEach(() => {
    push.mockReset();
    toastError.mockReset();
    mockUseToast.mockClear();
    mockVerifyMfa.mockReset();
    useAuthStore.getState().clearSession();
  });

  it("stores the access token and redirects to dashboard on successful verification", async () => {
    const user = userEvent.setup();
    mockVerifyMfa.mockResolvedValue({ access_token: "mfa-access-token" });

    renderWithQueryClient(<VerifyMfaHarness />);

    await user.click(screen.getByRole("button", { name: "Verify MFA" }));

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe("mfa-access-token");
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows a verification error and does not redirect on failure", async () => {
    const user = userEvent.setup();
    mockVerifyMfa.mockRejectedValue(
      new ApiError(401, { code: "MFA_INVALID", message: "Invalid code" })
    );

    renderWithQueryClient(<VerifyMfaHarness />);

    await user.click(screen.getByRole("button", { name: "Verify MFA" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Invalid verification code",
        "Check the code and try again."
      );
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});
