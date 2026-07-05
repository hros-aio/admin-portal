"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";
import { userEvent } from "@/tests/test-utils";
import { useConfirmPasswordReset, useRequestPasswordReset } from "./use-password-reset";

const push = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
const mockRequestPasswordReset = vi.hoisted(() => vi.fn<typeof authService.requestPasswordReset>());
const mockConfirmPasswordReset = vi.hoisted(() => vi.fn<typeof authService.confirmPasswordReset>());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    requestPasswordReset: mockRequestPasswordReset,
    confirmPasswordReset: mockConfirmPasswordReset,
  },
}));

vi.mock("@/lib/toast", () => ({
  useToast: vi.fn(() => ({
    success: toastSuccess,
    error: toastError,
  })),
}));

const mockUseToast = vi.mocked(useToast);

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function RequestResetHarness() {
  const requestPasswordReset = useRequestPasswordReset();

  return (
    <button
      type="button"
      onClick={() => {
        requestPasswordReset.mutate({ email: "admin@hros.com" });
      }}
    >
      Request Reset
    </button>
  );
}

function ConfirmResetHarness() {
  const confirmPasswordReset = useConfirmPasswordReset();

  return (
    <div>
      <span>{confirmPasswordReset.resetError ?? "none"}</span>
      <button
        type="button"
        onClick={() => {
          confirmPasswordReset.mutate({
            token: "reset-token",
            password: "StrongPass1!",
            password_confirmation: "StrongPass1!",
          });
        }}
      >
        Confirm Reset
      </button>
    </div>
  );
}

describe("password reset hooks", () => {
  beforeEach(() => {
    push.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
    mockUseToast.mockClear();
    mockRequestPasswordReset.mockReset();
    mockConfirmPasswordReset.mockReset();
  });

  it("shows generic success feedback for reset requests", async () => {
    const user = userEvent.setup();
    mockRequestPasswordReset.mockResolvedValue({
      message: "If an account exists for that email, a reset link has been sent.",
    });

    renderWithQueryClient(<RequestResetHarness />);

    await user.click(screen.getByRole("button", { name: "Request Reset" }));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: "admin@hros.com" });
      expect(toastSuccess).toHaveBeenCalledWith(
        "Check your email",
        "If an account exists for that email, a reset link has been sent."
      );
    });
  });

  it("shows safe non-enumerating feedback when reset requests fail", async () => {
    const user = userEvent.setup();
    mockRequestPasswordReset.mockRejectedValue(
      new ApiError(500, { code: "SERVER_ERROR", message: "Server error" })
    );

    renderWithQueryClient(<RequestResetHarness />);

    await user.click(screen.getByRole("button", { name: "Request Reset" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Unable to request reset",
        "Try again without changing the email address format."
      );
    });
  });

  it("redirects to login and shows success feedback after reset confirmation", async () => {
    const user = userEvent.setup();
    mockConfirmPasswordReset.mockResolvedValue({ message: "Password updated successfully." });

    renderWithQueryClient(<ConfirmResetHarness />);

    await user.click(screen.getByRole("button", { name: "Confirm Reset" }));

    await waitFor(() => {
      expect(mockConfirmPasswordReset).toHaveBeenCalledWith({
        token: "reset-token",
        password: "StrongPass1!",
        password_confirmation: "StrongPass1!",
      });
      expect(toastSuccess).toHaveBeenCalledWith(
        "Password updated",
        "You can now sign in with your new password."
      );
      expect(push).toHaveBeenCalledWith("/login");
    });
  });

  it.each([
    ["TOKEN_EXPIRED", "expired"],
    ["TOKEN_USED", "used"],
    ["PASSWORD_WEAK", "weak-password"],
    ["SERVER_ERROR", "unknown"],
  ] as const)("maps %s confirmation errors to %s", async (code, expectedError) => {
    const user = userEvent.setup();
    mockConfirmPasswordReset.mockRejectedValue(new ApiError(400, { code, message: code }));

    renderWithQueryClient(<ConfirmResetHarness />);

    await user.click(screen.getByRole("button", { name: "Confirm Reset" }));

    expect(await screen.findByText(expectedError)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
