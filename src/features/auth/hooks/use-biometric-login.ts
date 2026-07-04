"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  authService,
  type BiometricChallengeResponse,
  type BiometricVerifyRequest,
  type LoginResponse,
} from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";

export interface BiometricLoginInput {
  email: string;
  remember_me: boolean;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return toArrayBuffer(bytes);
}

function encodeBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAssertionCredential(value: Credential | null): value is PublicKeyCredential & {
  response: AuthenticatorAssertionResponse;
} {
  if (!isRecord(value)) return false;

  const response = value.response;
  return (
    value.rawId instanceof ArrayBuffer &&
    isRecord(response) &&
    response.authenticatorData instanceof ArrayBuffer &&
    response.clientDataJSON instanceof ArrayBuffer &&
    response.signature instanceof ArrayBuffer
  );
}

function supportsWebAuthn(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "credentials" in navigator &&
    typeof navigator.credentials.get === "function"
  );
}

function createCredentialRequestOptions(
  challenge: BiometricChallengeResponse
): PublicKeyCredentialRequestOptions {
  return {
    challenge: decodeBase64Url(challenge.challenge),
    allowCredentials: [
      {
        id: decodeBase64Url(challenge.credential_id),
        type: "public-key",
      },
    ],
    userVerification: "required",
  };
}

function createVerifyPayload(
  input: BiometricLoginInput,
  credential: PublicKeyCredential & { response: AuthenticatorAssertionResponse }
): BiometricVerifyRequest {
  return {
    email: input.email,
    credential_id: encodeBase64Url(credential.rawId),
    authenticator_data: encodeBase64Url(credential.response.authenticatorData),
    client_data_json: encodeBase64Url(credential.response.clientDataJSON),
    signature: encodeBase64Url(credential.response.signature),
    remember_me: input.remember_me,
  };
}

export function useBiometricLogin() {
  const router = useRouter();
  const toast = useToast();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation<LoginResponse, ApiError | Error, BiometricLoginInput>({
    mutationFn: async (input) => {
      if (!supportsWebAuthn()) {
        throw new Error("BIOMETRIC_UNSUPPORTED");
      }

      const challenge = await authService.createBiometricChallenge({ email: input.email });
      const credential = await navigator.credentials.get({
        publicKey: createCredentialRequestOptions(challenge),
      });

      if (!isAssertionCredential(credential)) {
        throw new Error("BIOMETRIC_CANCELLED");
      }

      return authService.verifyBiometric(createVerifyPayload(input, credential));
    },
    onSuccess: (response) => {
      if (response.access_token) {
        setToken(response.access_token);
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      if (error.message === "BIOMETRIC_UNSUPPORTED") {
        toast.error(
          "Biometric sign-in unavailable",
          "This browser does not support biometric sign-in."
        );
        return;
      }

      toast.error("Biometric sign-in failed", "Try again or use another sign-in method.");
    },
  });
}
