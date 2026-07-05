import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import PasswordResetRequestPage from "./page";
import { useRequestPasswordReset } from "@/features/auth/hooks/use-password-reset";

const requestPasswordResetMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  state: {
    isPending: false,
    isSuccess: false,
  },
}));

vi.mock("@/features/auth/hooks/use-password-reset", () => ({
  PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE:
    "If an account exists for that email, a reset link has been sent.",
  useRequestPasswordReset: vi.fn(() => ({
    mutate: requestPasswordResetMock.mutate,
    ...requestPasswordResetMock.state,
  })),
}));

describe("PasswordResetRequestPage", () => {
  beforeEach(() => {
    requestPasswordResetMock.mutate.mockReset();
    requestPasswordResetMock.state.isPending = false;
    requestPasswordResetMock.state.isSuccess = false;
    vi.mocked(useRequestPasswordReset).mockClear();
  });

  it("renders the password reset request form", () => {
    render(<PasswordResetRequestPage />);

    expect(screen.getByRole("heading", { name: "Reset Your Password" })).toBeInTheDocument();
    expect(
      screen.getByText("Enter your work email and we will send a secure recovery link.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Login" })).toHaveAttribute("href", "/login");
  });

  it("submits the reset request through the password reset hook", async () => {
    const user = userEvent.setup();

    render(<PasswordResetRequestPage />);

    await user.type(screen.getByLabelText("Work Email"), "admin@hros.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(requestPasswordResetMock.mutate).toHaveBeenCalledWith({ email: "admin@hros.com" });
    });
  });

  it("shows generic success messaging after a reset request", () => {
    requestPasswordResetMock.state.isSuccess = true;

    render(<PasswordResetRequestPage />);

    expect(
      screen.getByText("If an account exists for that email, a reset link has been sent.")
    ).toBeInTheDocument();
  });

  it("reflects loading state from the reset request hook", () => {
    requestPasswordResetMock.state.isPending = true;

    render(<PasswordResetRequestPage />);

    expect(screen.getByLabelText("Work Email")).toBeDisabled();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeDisabled();
  });
});
