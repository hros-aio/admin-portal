import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import CreatePasswordPage from "./page";
import { useConfirmPasswordReset } from "@/features/auth/hooks/use-password-reset";

const confirmPasswordResetMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  resetToken: "reset-token",
  state: {
    isPending: false,
    resetError: null as "expired" | "used" | "weak-password" | "unknown" | null,
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams(
      confirmPasswordResetMock.resetToken
        ? { token: confirmPasswordResetMock.resetToken }
        : undefined
    ),
}));

vi.mock("@/features/auth/hooks/use-password-reset", () => ({
  useConfirmPasswordReset: vi.fn(() => ({
    mutate: confirmPasswordResetMock.mutate,
    ...confirmPasswordResetMock.state,
  })),
}));

describe("CreatePasswordPage", () => {
  beforeEach(() => {
    confirmPasswordResetMock.resetToken = "reset-token";
    confirmPasswordResetMock.mutate.mockReset();
    confirmPasswordResetMock.state.isPending = false;
    confirmPasswordResetMock.state.resetError = null;
    vi.mocked(useConfirmPasswordReset).mockClear();
  });

  it("renders the reset password confirmation form", () => {
    render(<CreatePasswordPage />);

    expect(screen.getByRole("heading", { name: "Create New Password" })).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByText("Protect your HROS Admin access with a strong, unique password.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Password and Login" })).toBeInTheDocument();
  });

  it("submits confirmation values with the token from search params", async () => {
    const user = userEvent.setup();

    render(<CreatePasswordPage />);

    await user.type(screen.getByLabelText("New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm Password"), "StrongPass1!");
    await user.click(screen.getByRole("button", { name: "Update Password and Login" }));

    await waitFor(() => {
      expect(confirmPasswordResetMock.mutate).toHaveBeenCalledWith({
        token: "reset-token",
        password: "StrongPass1!",
        password_confirmation: "StrongPass1!",
      });
    });
  });

  it("renders an explicit error and no form when the token is missing", () => {
    confirmPasswordResetMock.resetToken = "";

    render(<CreatePasswordPage />);

    expect(screen.getByText("Invalid reset link")).toBeInTheDocument();
    expect(screen.getByText("Request a new password reset link to continue.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Update Password and Login" })
    ).not.toBeInTheDocument();
  });

  it("renders an explicit error when the token is expired", () => {
    confirmPasswordResetMock.state.resetError = "expired";

    render(<CreatePasswordPage />);

    expect(screen.getByText("Reset link expired")).toBeInTheDocument();
    expect(screen.getByText("Request a new password reset link to continue.")).toBeInTheDocument();
  });

  it("maps weak password responses onto the password field", () => {
    confirmPasswordResetMock.state.resetError = "weak-password";

    render(<CreatePasswordPage />);

    expect(screen.getByText("Choose a stronger password and try again.")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("reflects loading state from the reset confirmation hook", () => {
    confirmPasswordResetMock.state.isPending = true;

    render(<CreatePasswordPage />);

    expect(screen.getByLabelText("New Password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: /update password and login/i })).toBeDisabled();
  });
});
