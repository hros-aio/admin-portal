import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import { MfaChallengeForm } from "./mfa-challenge-form";

describe("MfaChallengeForm", () => {
  it("submits the challenge token and validated code through the provided handler", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<MfaChallengeForm mfaToken="mfa-token" onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.paste("123456");

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        mfa_token: "mfa-token",
        code: "123456",
      });
    });
  });

  it("shows a validation error when the code is incomplete", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<MfaChallengeForm mfaToken="mfa-token" onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.paste("123");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders the Figma MFA support controls", () => {
    render(<MfaChallengeForm mfaToken="mfa-token" onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText("Code expires in 01:52")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend Code" })).toBeDisabled();
    expect(screen.getByLabelText("Trust this device for 30 days")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Alternative: Use WebAuthn / Security Key" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel and Return to Login" })).toBeInTheDocument();
    expect(screen.getByText("End-to-End Encrypted Session")).toBeInTheDocument();
  });

  it("calls cancel when the return-to-login action is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<MfaChallengeForm mfaToken="mfa-token" onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel and Return to Login" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("disables interactive controls while loading", () => {
    render(<MfaChallengeForm mfaToken="mfa-token" onSubmit={vi.fn()} isLoading />);

    expect(screen.getByLabelText("Digit 1 of 6")).toBeDisabled();
    expect(screen.getByLabelText("Digit 6 of 6")).toBeDisabled();
    expect(screen.getByLabelText("Trust this device for 30 days")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Alternative: Use WebAuthn / Security Key" })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel and Return to Login" })).toBeDisabled();
  });
});
