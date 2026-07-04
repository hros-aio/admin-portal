"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useToast } from "@/lib/toast";
import { userEvent } from "@/tests/test-utils";
import { useBiometricLogin } from "./use-biometric-login";

const push = vi.fn();
const toastError = vi.fn();
const credentialGet = vi.fn();
const mockCreateBiometricChallenge = vi.hoisted(() =>
  vi.fn<typeof authService.createBiometricChallenge>()
);
const mockVerifyBiometric = vi.hoisted(() => vi.fn<typeof authService.verifyBiometric>());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    createBiometricChallenge: mockCreateBiometricChallenge,
    verifyBiometric: mockVerifyBiometric,
  },
}));

vi.mock("@/lib/toast", () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: toastError,
  })),
}));

const mockUseToast = vi.mocked(useToast);

function textBuffer(value: string): ArrayBuffer {
  const buffer = new ArrayBuffer(value.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index);
  }

  return buffer;
}

function BiometricLoginHarness({ onMfaRequired }: { onMfaRequired?: (mfaToken: string) => void }) {
  const biometricLogin = useBiometricLogin(onMfaRequired ? { onMfaRequired } : undefined);

  return (
    <button
      type="button"
      onClick={() => {
        biometricLogin.mutate({
          email: "admin@hros.com",
          remember_me: true,
        });
      }}
    >
      Use Biometrics
    </button>
  );
}

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function setCredentialsApi(value: CredentialsContainer | undefined) {
  if (value === undefined) {
    Reflect.deleteProperty(navigator, "credentials");
    return;
  }

  Object.defineProperty(navigator, "credentials", {
    configurable: true,
    value,
  });
}

describe("useBiometricLogin", () => {
  beforeEach(() => {
    push.mockReset();
    toastError.mockReset();
    credentialGet.mockReset();
    mockUseToast.mockClear();
    mockCreateBiometricChallenge.mockReset();
    mockVerifyBiometric.mockReset();
    useAuthStore.getState().clearSession();
    setCredentialsApi({ get: credentialGet } as unknown as CredentialsContainer);
  });

  it("shows an unsupported-browser error without calling backend verification", async () => {
    const user = userEvent.setup();
    setCredentialsApi(undefined);

    renderWithQueryClient(<BiometricLoginHarness />);

    await user.click(screen.getByRole("button", { name: "Use Biometrics" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Biometric sign-in unavailable",
        "This browser does not support biometric sign-in."
      );
    });
    expect(mockCreateBiometricChallenge).not.toHaveBeenCalled();
    expect(mockVerifyBiometric).not.toHaveBeenCalled();
  });

  it("stores the access token and redirects after successful biometric verification", async () => {
    const user = userEvent.setup();
    mockCreateBiometricChallenge.mockResolvedValue({
      challenge: "Y2hhbGxlbmdl",
      credential_id: "Y3JlZGVudGlhbC1pZA",
    });
    credentialGet.mockResolvedValue({
      rawId: textBuffer("raw-id"),
      response: {
        authenticatorData: textBuffer("authenticator-data"),
        clientDataJSON: textBuffer("client-data-json"),
        signature: textBuffer("signature"),
      },
    });
    mockVerifyBiometric.mockResolvedValue({ access_token: "biometric-access-token" });

    renderWithQueryClient(<BiometricLoginHarness />);

    await user.click(screen.getByRole("button", { name: "Use Biometrics" }));

    await waitFor(() => {
      expect(mockCreateBiometricChallenge).toHaveBeenCalledWith({ email: "admin@hros.com" });
      expect(credentialGet).toHaveBeenCalledWith({
        publicKey: expect.objectContaining({
          allowCredentials: [
            expect.objectContaining({
              type: "public-key",
            }),
          ],
          userVerification: "required",
        }),
      });
      expect(mockVerifyBiometric).toHaveBeenCalledWith({
        email: "admin@hros.com",
        credential_id: "cmF3LWlk",
        authenticator_data: "YXV0aGVudGljYXRvci1kYXRh",
        client_data_json: "Y2xpZW50LWRhdGEtanNvbg",
        signature: "c2lnbmF0dXJl",
        remember_me: true,
      });
      expect(useAuthStore.getState().accessToken).toBe("biometric-access-token");
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("forwards MFA-required biometric responses without storing a token or redirecting", async () => {
    const user = userEvent.setup();
    const onMfaRequired = vi.fn();
    mockCreateBiometricChallenge.mockResolvedValue({
      challenge: "Y2hhbGxlbmdl",
      credential_id: "Y3JlZGVudGlhbC1pZA",
    });
    credentialGet.mockResolvedValue({
      rawId: textBuffer("raw-id"),
      response: {
        authenticatorData: textBuffer("authenticator-data"),
        clientDataJSON: textBuffer("client-data-json"),
        signature: textBuffer("signature"),
      },
    });
    mockVerifyBiometric.mockResolvedValue({ mfa_required: true, mfa_token: "mfa-token" });

    renderWithQueryClient(<BiometricLoginHarness onMfaRequired={onMfaRequired} />);

    await user.click(screen.getByRole("button", { name: "Use Biometrics" }));

    await waitFor(() => {
      expect(onMfaRequired).toHaveBeenCalledWith("mfa-token");
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a generic biometric error when challenge creation fails", async () => {
    const user = userEvent.setup();
    mockCreateBiometricChallenge.mockRejectedValue(new Error("Challenge failed"));

    renderWithQueryClient(<BiometricLoginHarness />);

    await user.click(screen.getByRole("button", { name: "Use Biometrics" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Biometric sign-in failed",
        "Try again or use another sign-in method."
      );
    });
    expect(mockVerifyBiometric).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a generic biometric error when verification fails", async () => {
    const user = userEvent.setup();
    mockCreateBiometricChallenge.mockResolvedValue({
      challenge: "Y2hhbGxlbmdl",
      credential_id: "Y3JlZGVudGlhbC1pZA",
    });
    credentialGet.mockResolvedValue({
      rawId: textBuffer("raw-id"),
      response: {
        authenticatorData: textBuffer("authenticator-data"),
        clientDataJSON: textBuffer("client-data-json"),
        signature: textBuffer("signature"),
      },
    });
    mockVerifyBiometric.mockRejectedValue(new Error("Verification failed"));

    renderWithQueryClient(<BiometricLoginHarness />);

    await user.click(screen.getByRole("button", { name: "Use Biometrics" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Biometric sign-in failed",
        "Try again or use another sign-in method."
      );
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a generic biometric error when the credential prompt is cancelled", async () => {
    const user = userEvent.setup();
    mockCreateBiometricChallenge.mockResolvedValue({
      challenge: "Y2hhbGxlbmdl",
      credential_id: "Y3JlZGVudGlhbC1pZA",
    });
    credentialGet.mockResolvedValue({
      rawId: textBuffer("raw-id"),
      response: {
        clientDataJSON: textBuffer("client-data-json"),
      },
    });

    renderWithQueryClient(<BiometricLoginHarness />);

    await user.click(screen.getByRole("button", { name: "Use Biometrics" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Biometric sign-in failed",
        "Try again or use another sign-in method."
      );
    });
    expect(mockVerifyBiometric).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});
