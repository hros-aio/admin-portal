import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("submits validated login values through the provided handler", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "secret-password");
    await user.click(screen.getByLabelText("Keep me logged in for 30 days"));
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          email: "admin@example.com",
          password: "secret-password",
          remember_me: true,
        },
        expect.anything()
      );
    });
  });

  it("toggles password visibility without clearing the password", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    const password = screen.getByLabelText("Password");
    await user.type(password, "secret-password");

    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("secret-password");

    await user.click(screen.getByRole("button", { name: "Hide password" }));

    expect(password).toHaveAttribute("type", "password");
  });

  it("disables interactive controls while loading", () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading />);

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByLabelText("Keep me logged in for 30 days")).toBeDisabled();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue with SSO" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Use Biometrics" })).toBeDisabled();
  });
});
