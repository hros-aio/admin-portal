import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import { ResetPasswordForm } from "./reset-password-form";

describe("ResetPasswordForm", () => {
  it("submits validated password values through the provided handler", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm Password"), "StrongPass1!");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          password: "StrongPass1!",
          password_confirmation: "StrongPass1!",
        },
        expect.anything()
      );
    });
  });

  it("blocks weak password submissions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New Password"), "weak");
    await user.type(screen.getByLabelText("Confirm Password"), "weak");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByText("Password must be at least 10 characters")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks mismatched password submissions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm Password"), "Different1!");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("toggles password visibility without clearing entered values", async () => {
    const user = userEvent.setup();

    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    const password = screen.getByLabelText("New Password");
    await user.type(password, "StrongPass1!");

    expect(password).toHaveAttribute("type", "password");

    const passwordToggle = screen.getAllByRole("button", { name: "Show password" }).at(0);
    if (!passwordToggle) {
      throw new Error("Expected password visibility toggle to render");
    }
    await user.click(passwordToggle);

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("StrongPass1!");
  });

  it("disables interactive controls while loading", () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} isLoading />);

    expect(screen.getByLabelText("New Password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: /update password/i })).toBeDisabled();
    for (const toggle of screen.getAllByRole("button", { name: "Show password" })) {
      expect(toggle).toBeDisabled();
    }
  });
});
