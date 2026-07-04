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
});
