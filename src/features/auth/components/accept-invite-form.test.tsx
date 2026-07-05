import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import { AcceptInviteForm } from "./accept-invite-form";

describe("AcceptInviteForm", () => {
  it("submits validated invite values through the provided handler", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AcceptInviteForm token="invite-token" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Create New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm Password"), "StrongPass1!");
    await user.click(screen.getByRole("button", { name: "Accept Invitation & Create Account" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          token: "invite-token",
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

    render(<AcceptInviteForm token="invite-token" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Create New Password"), "weak");
    await user.type(screen.getByLabelText("Confirm Password"), "weak");
    await user.click(screen.getByRole("button", { name: "Accept Invitation & Create Account" }));

    expect(await screen.findByText("Password must be at least 10 characters")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks mismatched password submissions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AcceptInviteForm token="invite-token" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Create New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm Password"), "Different1!");
    await user.click(screen.getByRole("button", { name: "Accept Invitation & Create Account" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders a password field error provided by the caller", () => {
    render(
      <AcceptInviteForm
        token="invite-token"
        onSubmit={vi.fn()}
        passwordError="Choose a stronger password."
      />
    );

    expect(screen.getByText("Choose a stronger password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Create New Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("disables interactive controls while loading", () => {
    render(<AcceptInviteForm token="invite-token" onSubmit={vi.fn()} isLoading />);

    expect(screen.getByLabelText("Create New Password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm Password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /accept invitation & create account/i })
    ).toBeDisabled();
    for (const toggle of screen.getAllByRole("button", { name: "Show password" })) {
      expect(toggle).toBeDisabled();
    }
  });
});
