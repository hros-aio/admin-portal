import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import { ForgotPasswordForm } from "./forgot-password-form";

describe("ForgotPasswordForm", () => {
  it("submits validated email values through the provided handler", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Work Email"), "admin@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: "admin@example.com" }, expect.anything());
    });
  });

  it("blocks invalid email submissions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Work Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables interactive controls while loading", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} isLoading />);

    expect(screen.getByLabelText("Work Email")).toBeDisabled();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeDisabled();
  });
});
