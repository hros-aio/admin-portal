"use client";

import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, userEvent } from "@/tests/test-utils";
import LoginPage from "./page";
import { useBiometricLogin } from "@/features/auth/hooks/use-biometric-login";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useVerifyMfa } from "@/features/auth/hooks/use-verify-mfa";

type UseLoginOptions = Parameters<typeof useLogin>[0];
type UseBiometricLoginOptions = Parameters<typeof useBiometricLogin>[0];

const loginMutate = vi.fn();
const verifyMfaMutate = vi.fn();
const biometricMutate = vi.fn();
const locationAssign = vi.fn();
let loginOptions: UseLoginOptions;
let biometricOptions: UseBiometricLoginOptions;

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

vi.mock("@/features/auth/hooks/use-biometric-login", () => ({
  useBiometricLogin: vi.fn((options: UseBiometricLoginOptions) => {
    biometricOptions = options;

    return {
      mutate: biometricMutate,
      isPending: false,
    };
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    loginMutate.mockReset();
    verifyMfaMutate.mockReset();
    biometricMutate.mockReset();
    locationAssign.mockReset();
    vi.mocked(useLogin).mockClear();
    vi.mocked(useVerifyMfa).mockClear();
    vi.mocked(useBiometricLogin).mockClear();
    loginOptions = undefined;
    biometricOptions = undefined;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...window.location,
        assign: locationAssign,
      },
    });
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

  it("performs a full browser redirect when SSO is selected", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Continue with SSO" }));

    expect(locationAssign).toHaveBeenCalledWith("/auth/sso/initiate?provider=saml");
  });

  it("passes biometric login values from the login form", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.click(screen.getByLabelText("Keep me logged in for 30 days"));
    await user.click(screen.getByRole("button", { name: "Use Biometrics" }));

    await waitFor(() => {
      expect(biometricMutate).toHaveBeenCalledWith({
        email: "admin@example.com",
        remember_me: true,
      });
    });
  });

  it("switches to MFA when biometric login returns an MFA token", async () => {
    render(<LoginPage />);

    act(() => {
      biometricOptions?.onMfaRequired?.("biometric-mfa-token");
    });

    expect(
      await screen.findByRole("heading", { name: "Two-Factor Verification" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
  });
});
