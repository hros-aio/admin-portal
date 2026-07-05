import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAcceptInvite } from "@/features/auth/hooks/use-accept-invite";
import { render, userEvent } from "@/tests/test-utils";
import AcceptInvitePage from "./page";

const acceptInviteMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  inviteToken: "invite-token",
  inviteEmail: "alex.r@acmecorp.com",
  state: {
    isPending: false,
    inviteError: null as "expired" | "used" | "weak-password" | "unknown" | null,
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => {
    const params = new URLSearchParams();
    if (acceptInviteMock.inviteToken) params.set("token", acceptInviteMock.inviteToken);
    if (acceptInviteMock.inviteEmail) params.set("email", acceptInviteMock.inviteEmail);
    return params;
  },
}));

vi.mock("@/features/auth/hooks/use-accept-invite", () => ({
  useAcceptInvite: vi.fn(() => ({
    mutate: acceptInviteMock.mutate,
    ...acceptInviteMock.state,
  })),
}));

describe("AcceptInvitePage", () => {
  beforeEach(() => {
    acceptInviteMock.inviteToken = "invite-token";
    acceptInviteMock.inviteEmail = "alex.r@acmecorp.com";
    acceptInviteMock.mutate.mockReset();
    acceptInviteMock.state.isPending = false;
    acceptInviteMock.state.inviteError = null;
    vi.mocked(useAcceptInvite).mockClear();
  });

  it("renders the accept invitation form", () => {
    render(<AcceptInvitePage />);

    expect(
      screen.getByRole("heading", { name: "You have been invited to join Acme Corp Global" })
    ).toBeInTheDocument();
    expect(screen.getByText("alex.r@acmecorp.com")).toBeInTheDocument();
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
    expect(screen.getByLabelText("Create New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByText("Administrative invitation for the HROS secure environment.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Accept Invitation & Create Account" })
    ).toBeInTheDocument();
  });

  it("submits invite values with the token from search params", async () => {
    const user = userEvent.setup();

    render(<AcceptInvitePage />);

    await user.type(screen.getByLabelText("Create New Password"), "StrongPass1!");
    await user.type(screen.getByLabelText("Confirm Password"), "StrongPass1!");
    await user.click(screen.getByRole("button", { name: "Accept Invitation & Create Account" }));

    await waitFor(() => {
      expect(acceptInviteMock.mutate).toHaveBeenCalledWith({
        token: "invite-token",
        password: "StrongPass1!",
        password_confirmation: "StrongPass1!",
      });
    });
  });

  it("renders an explicit error and no form when the token is missing", () => {
    acceptInviteMock.inviteToken = "";

    render(<AcceptInvitePage />);

    expect(screen.getByText("Invalid invitation link")).toBeInTheDocument();
    expect(
      screen.getByText("Ask your administrator for a new invitation link to continue.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Accept Invitation & Create Account" })
    ).not.toBeInTheDocument();
  });

  it("renders an explicit error and no form when the email is missing", () => {
    acceptInviteMock.inviteEmail = "";

    render(<AcceptInvitePage />);

    expect(screen.getByText("Invalid invitation link")).toBeInTheDocument();
    expect(
      screen.getByText("Ask your administrator for a new invitation link to continue.")
    ).toBeInTheDocument();
    expect(screen.getByText("Unknown email")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Accept Invitation & Create Account" })
    ).not.toBeInTheDocument();
  });

  it("renders an explicit error when the invite is expired", () => {
    acceptInviteMock.state.inviteError = "expired";

    render(<AcceptInvitePage />);

    expect(screen.getByText("Invitation expired")).toBeInTheDocument();
    expect(screen.getByText("This invitation has expired...")).toBeInTheDocument();
  });

  it("renders an explicit error when the invite has already been used", () => {
    acceptInviteMock.state.inviteError = "used";

    render(<AcceptInvitePage />);

    expect(screen.getByText("Invitation already used")).toBeInTheDocument();
    expect(screen.getByText("This invitation has already been used.")).toBeInTheDocument();
  });

  it("maps weak password responses onto the password field", () => {
    acceptInviteMock.state.inviteError = "weak-password";

    render(<AcceptInvitePage />);

    expect(screen.getByText("Choose a stronger password and try again.")).toBeInTheDocument();
    expect(screen.getByLabelText("Create New Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("renders safe retry feedback for unknown failures", () => {
    acceptInviteMock.state.inviteError = "unknown";

    render(<AcceptInvitePage />);

    expect(screen.getByText("Unable to accept invitation")).toBeInTheDocument();
    expect(screen.getByText("Try again or contact your administrator.")).toBeInTheDocument();
  });

  it("reflects loading state from the accept invite hook", () => {
    acceptInviteMock.state.isPending = true;

    render(<AcceptInvitePage />);

    expect(screen.getByLabelText("Create New Password")).toBeDisabled();
    expect(screen.getByLabelText("Confirm Password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /accept invitation & create account/i })
    ).toBeDisabled();
  });
});
