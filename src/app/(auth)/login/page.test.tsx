"use client";

import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import LoginPage from "./page";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useVerifyMfa } from "@/features/auth/hooks/use-verify-mfa";

type UseLoginOptions = Parameters<typeof useLogin>[0];

const loginMutate = vi.fn();
const verifyMfaMutate = vi.fn();
let loginOptions: UseLoginOptions;

vi.mock("@/features/auth/hooks/use-login", () => ({
  useLogin: vi.fn((options: UseLoginOptions) => {
    loginOptions = options;

    return {
      mutate: loginMutate,
      isPending: false,
    };
  }),
}));

vi.mock("@/features/auth/hooks/use-verify-mfa", () => ({
  useVerifyMfa: vi.fn(() => ({
    mutate: verifyMfaMutate,
    isPending: false,
  })),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    loginMutate.mockReset();
    verifyMfaMutate.mockReset();
    vi.mocked(useLogin).mockClear();
    vi.mocked(useVerifyMfa).mockClear();
    loginOptions = undefined;
  });

  it("switches from credential login to the MFA challenge when login returns an MFA token", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();

    act(() => {
      loginOptions?.onMfaRequired?.("mfa-token");
    });

    expect(
      await screen.findByRole("heading", { name: "Two-Factor Verification" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.paste("123456");

    await waitFor(() => {
      expect(verifyMfaMutate).toHaveBeenCalledWith({
        mfa_token: "mfa-token",
        code: "123456",
      });
    });
  });

  it("returns to credential login from the MFA challenge", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    act(() => {
      loginOptions?.onMfaRequired?.("mfa-token");
    });

    await user.click(await screen.findByRole("button", { name: "Cancel and Return to Login" }));

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });
});
