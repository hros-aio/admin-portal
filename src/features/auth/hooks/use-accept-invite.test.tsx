"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";
import { userEvent } from "@/tests/test-utils";
import { useAcceptInvite } from "./use-accept-invite";

const push = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
const mockAcceptInvite = vi.hoisted(() => vi.fn<typeof authService.acceptInvite>());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    acceptInvite: mockAcceptInvite,
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

function AcceptInviteHarness() {
  const acceptInvite = useAcceptInvite();

  return (
    <div>
      <span>{acceptInvite.inviteError ?? "none"}</span>
      <button
        type="button"
        onClick={() => {
          acceptInvite.mutate({
            token: "invite-token",
            password: "StrongPass1!",
            password_confirmation: "StrongPass1!",
          });
        }}
      >
        Accept Invite
      </button>
    </div>
  );
}

describe("useAcceptInvite", () => {
  beforeEach(() => {
    push.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
    mockUseToast.mockClear();
    mockAcceptInvite.mockReset();
  });

  it("redirects to login and shows success feedback after invite acceptance", async () => {
    const user = userEvent.setup();
    mockAcceptInvite.mockResolvedValue({ message: "Account activated successfully." });

    renderWithQueryClient(<AcceptInviteHarness />);

    await user.click(screen.getByRole("button", { name: "Accept Invite" }));

    await waitFor(() => {
      expect(mockAcceptInvite).toHaveBeenCalledWith({
        token: "invite-token",
        password: "StrongPass1!",
        password_confirmation: "StrongPass1!",
      });
      expect(toastSuccess).toHaveBeenCalledWith(
        "Account activated",
        "You can now sign in with your administrator account."
      );
      expect(push).toHaveBeenCalledWith("/login");
    });
  });

  it.each([
    ["INVITE_EXPIRED", "expired"],
    ["INVITE_USED", "used"],
    ["PASSWORD_WEAK", "weak-password"],
    ["SERVER_ERROR", "unknown"],
  ] as const)("maps %s invite errors to %s", async (code, expectedError) => {
    const user = userEvent.setup();
    mockAcceptInvite.mockRejectedValue(new ApiError(400, { code, message: code }));

    renderWithQueryClient(<AcceptInviteHarness />);

    await user.click(screen.getByRole("button", { name: "Accept Invite" }));

    expect(await screen.findByText(expectedError)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows password feedback toast for weak password responses", async () => {
    const user = userEvent.setup();
    mockAcceptInvite.mockRejectedValue(
      new ApiError(422, { code: "PASSWORD_WEAK", message: "Password weak" })
    );

    renderWithQueryClient(<AcceptInviteHarness />);

    await user.click(screen.getByRole("button", { name: "Accept Invite" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Password is too weak",
        "Choose a stronger password and try again."
      );
    });
  });

  it("shows safe retry feedback for unknown invite failures", async () => {
    const user = userEvent.setup();
    mockAcceptInvite.mockRejectedValue(
      new ApiError(500, { code: "SERVER_ERROR", message: "Server error" })
    );

    renderWithQueryClient(<AcceptInviteHarness />);

    await user.click(screen.getByRole("button", { name: "Accept Invite" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Unable to accept invitation",
        "Try again or contact your administrator."
      );
    });
  });
});
