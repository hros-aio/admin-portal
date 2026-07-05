import { describe, expect, it, vi } from "vitest";

import { rawClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/result";

import { authService } from "./auth.service";

vi.mock("@/lib/api/client", () => ({
  rawClient: {
    POST: vi.fn(),
  },
}));

const mockPost = vi.mocked(rawClient.POST);
type PostResult = Awaited<ReturnType<typeof rawClient.POST>>;

function mockPostResult(result: unknown): void {
  mockPost.mockResolvedValue(result as PostResult);
}

describe("authService", () => {
  describe("login", () => {
    it("returns the login response from a successful login", async () => {
      mockPostResult({
        data: { access_token: "access-token" },
        response: new Response(null, { status: 200 }),
      });

      await expect(
        authService.login({
          email: "admin@hros.com",
          password: "password",
          remember_me: true,
        })
      ).resolves.toEqual({ access_token: "access-token" });

      expect(mockPost).toHaveBeenCalledWith("/v1/auth/login", {
        body: {
          email: "admin@hros.com",
          password: "password",
          remember_me: true,
        },
      });
    });

    it("throws ApiError when login returns an error", async () => {
      mockPostResult({
        error: { code: "ACCOUNT_LOCKED", message: "Account locked" },
        response: new Response(null, { status: 401 }),
      });

      await expect(
        authService.login({
          email: "admin@hros.com",
          password: "password",
          remember_me: false,
        })
      ).rejects.toBeInstanceOf(ApiError);
    });

    it("throws ApiError when the login response body is empty", async () => {
      mockPostResult({
        response: new Response(null, { status: 200 }),
      });

      await expect(
        authService.login({
          email: "admin@hros.com",
          password: "password",
          remember_me: false,
        })
      ).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("verifyMfa", () => {
    it("returns the login response from successful MFA verification", async () => {
      mockPostResult({
        data: { access_token: "mfa-access-token" },
        response: new Response(null, { status: 200 }),
      });

      await expect(
        authService.verifyMfa({
          mfa_token: "mfa-token",
          code: "123456",
        })
      ).resolves.toEqual({ access_token: "mfa-access-token" });

      expect(mockPost).toHaveBeenCalledWith("/v1/auth/mfa/verify", {
        body: {
          mfa_token: "mfa-token",
          method: "totp",
          code: "123456",
        },
      });
    });

    it("throws ApiError when MFA verification returns an error", async () => {
      mockPostResult({
        error: { code: "MFA_INVALID", message: "Invalid code" },
        response: new Response(null, { status: 401 }),
      });

      await expect(
        authService.verifyMfa({
          mfa_token: "mfa-token",
          code: "123456",
        })
      ).rejects.toBeInstanceOf(ApiError);
    });

    it("throws ApiError when the MFA verification response body is empty", async () => {
      mockPostResult({
        response: new Response(null, { status: 200 }),
      });

      await expect(
        authService.verifyMfa({
          mfa_token: "mfa-token",
          code: "123456",
        })
      ).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("createBiometricChallenge", () => {
    it("returns the biometric challenge response", async () => {
      mockPostResult({
        data: { challenge: "challenge", credential_id: "credential-id" },
        response: new Response(null, { status: 200 }),
      });

      await expect(
        authService.createBiometricChallenge({ email: "admin@hros.com" })
      ).resolves.toEqual({
        challenge: "challenge",
        credential_id: "credential-id",
      });

      expect(mockPost).toHaveBeenCalledWith("/v1/auth/biometric/challenge", {
        body: { email: "admin@hros.com" },
      });
    });

    it("throws ApiError when the biometric challenge response body is empty", async () => {
      mockPostResult({
        response: new Response(null, { status: 200 }),
      });

      await expect(
        authService.createBiometricChallenge({ email: "admin@hros.com" })
      ).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("verifyBiometric", () => {
    const payload = {
      email: "admin@hros.com",
      credential_id: "credential-id",
      authenticator_data: "authenticator-data",
      client_data_json: "client-data-json",
      signature: "signature",
      remember_me: true,
    };

    it("returns the login response from successful biometric verification", async () => {
      mockPostResult({
        data: { access_token: "biometric-access-token" },
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.verifyBiometric(payload)).resolves.toEqual({
        access_token: "biometric-access-token",
      });

      expect(mockPost).toHaveBeenCalledWith("/v1/auth/biometric/verify", {
        body: payload,
      });
    });

    it("throws ApiError when biometric verification returns an error", async () => {
      mockPostResult({
        error: { code: "UNAUTHORIZED", message: "Verification failed" },
        response: new Response(null, { status: 401 }),
      });

      await expect(authService.verifyBiometric(payload)).rejects.toBeInstanceOf(ApiError);
    });

    it("throws ApiError when the biometric verification response body is empty", async () => {
      mockPostResult({
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.verifyBiometric(payload)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("refreshSession", () => {
    it("returns the access token from a successful refresh", async () => {
      mockPostResult({
        data: { access_token: "new-access-token" },
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.refreshSession()).resolves.toBe("new-access-token");
    });

    it("throws ApiError when the refresh endpoint returns an error", async () => {
      mockPostResult({
        error: { code: "UNAUTHORIZED", message: "Session expired" },
        response: new Response(null, { status: 401 }),
      });

      await expect(authService.refreshSession()).rejects.toBeInstanceOf(ApiError);
    });

    it("throws ApiError when the response body omits the access token", async () => {
      mockPostResult({
        data: {},
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.refreshSession()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("requestPasswordReset", () => {
    it("returns the reset request response from a successful request", async () => {
      mockPostResult({
        data: { message: "If an account exists for that email, a reset link has been sent." },
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.requestPasswordReset({ email: "admin@hros.com" })).resolves.toEqual({
        message: "If an account exists for that email, a reset link has been sent.",
      });

      expect(mockPost).toHaveBeenCalledWith("/v1/auth/password-reset/request", {
        body: { email: "admin@hros.com" },
      });
    });

    it("throws ApiError when reset request returns an error", async () => {
      mockPostResult({
        error: { code: "BAD_REQUEST", message: "Invalid request" },
        response: new Response(null, { status: 400 }),
      });

      await expect(
        authService.requestPasswordReset({ email: "admin@hros.com" })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
        status: 400,
      });
    });
  });

  describe("confirmPasswordReset", () => {
    const payload = {
      token: "reset-token",
      password: "StrongPass1!",
      password_confirmation: "StrongPass1!",
    };

    it("returns the reset confirmation response from a successful confirmation", async () => {
      mockPostResult({
        data: { message: "Password updated successfully." },
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.confirmPasswordReset(payload)).resolves.toEqual({
        message: "Password updated successfully.",
      });

      expect(mockPost).toHaveBeenCalledWith("/v1/auth/password-reset/confirm", {
        body: payload,
      });
    });

    it("throws ApiError preserving reset confirmation error codes", async () => {
      mockPostResult({
        error: { code: "TOKEN_EXPIRED", message: "Reset token expired" },
        response: new Response(null, { status: 400 }),
      });

      await expect(authService.confirmPasswordReset(payload)).rejects.toMatchObject({
        code: "TOKEN_EXPIRED",
        status: 400,
      });
    });
  });

  describe("acceptInvite", () => {
    const payload = {
      token: "invite-token",
      password: "StrongPass1!",
      password_confirmation: "StrongPass1!",
    };

    it("returns the accept invite response from a successful activation", async () => {
      mockPostResult({
        data: { message: "Account activated successfully." },
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.acceptInvite(payload)).resolves.toEqual({
        message: "Account activated successfully.",
      });

      expect(mockPost).toHaveBeenCalledWith("/v1/auth/accept-invite", {
        body: payload,
      });
    });

    it.each(["INVITE_EXPIRED", "INVITE_USED"] as const)(
      "throws ApiError preserving %s invite error code",
      async (code) => {
        mockPostResult({
          error: { code, message: code },
          response: new Response(null, { status: 400 }),
        });

        await expect(authService.acceptInvite(payload)).rejects.toMatchObject({
          code,
          status: 400,
        });
      }
    );
  });
});
