import { beforeEach, describe, expect, it, vi } from "vitest";

import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { MiddlewareCallbackParams } from "openapi-fetch";

import { authMiddleware } from "./auth-middleware";

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    refreshSession: vi.fn(),
  },
}));

vi.mock("@/features/auth/stores/auth-store", () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

type AuthState = ReturnType<typeof useAuthStore.getState>;

const mockGetState = vi.fn<() => AuthState>();
useAuthStore.getState = mockGetState;

const mockRefreshSession = vi.fn<() => Promise<string>>();
authService.refreshSession = mockRefreshSession;

beforeEach(() => {
  mockRefreshSession.mockClear();
  mockGetState.mockClear();
});

function invokeOnRequest(params: MiddlewareCallbackParams): Request {
  const handler = authMiddleware.onRequest;
  if (!handler) {
    throw new Error("onRequest handler is not defined");
  }
  return handler(params) as Request;
}

async function invokeOnResponse(
  params: MiddlewareCallbackParams & { response: Response }
): Promise<Response> {
  const handler = authMiddleware.onResponse;
  if (!handler) {
    throw new Error("onResponse handler is not defined");
  }
  return (await handler(params)) as Response;
}

function createParams(overrides: {
  request: Request;
  response: Response;
  options?: { fetch: typeof globalThis.fetch };
  schemaPath?: string;
}): MiddlewareCallbackParams & { response: Response } {
  const { request, response, options, schemaPath } = overrides;
  return {
    url: request.url,
    request,
    schemaPath: schemaPath ?? "/v1/tenants",
    params: {},
    id: "test-request-id",
    options: options as MiddlewareCallbackParams["options"],
    response,
  };
}

describe("authMiddleware", () => {
  describe("onRequest", () => {
    it("attaches the Authorization header when an access token exists", () => {
      mockGetState.mockReturnValue({
        accessToken: "existing-token",
        setToken: vi.fn(),
        clearSession: vi.fn(),
      });

      const request = new Request("http://localhost/v1/tenants");
      const result = invokeOnRequest(createParams({ request, response: new Response() }));

      expect(result.headers.get("Authorization")).toBe("Bearer existing-token");
    });

    it("does not attach an Authorization header when the store has no token", () => {
      mockGetState.mockReturnValue({
        accessToken: null,
        setToken: vi.fn(),
        clearSession: vi.fn(),
      });

      const request = new Request("http://localhost/v1/tenants");
      const result = invokeOnRequest(createParams({ request, response: new Response() }));

      expect(result.headers.has("Authorization")).toBe(false);
    });
  });

  describe("onResponse", () => {
    it("returns non-401 responses unchanged", async () => {
      const response = new Response(null, { status: 200 });
      const result = await invokeOnResponse(
        createParams({ request: new Request("http://localhost/v1/tenants"), response })
      );

      expect(result).toBe(response);
      expect(mockRefreshSession).not.toHaveBeenCalled();
    });

    it("refreshes the token and retries a 401 request with the new token", async () => {
      const setToken = vi.fn();
      const clearSession = vi.fn();
      mockGetState.mockReturnValue({
        accessToken: "old-token",
        setToken,
        clearSession,
      });
      mockRefreshSession.mockResolvedValue("new-token");

      const retryResponse = new Response(JSON.stringify({ data: {} }), { status: 200 });
      const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(retryResponse);
      const request = new Request("http://localhost/v1/tenants");
      const response = new Response(null, { status: 401 });

      const result = await invokeOnResponse(
        createParams({ request, response, options: { fetch }, schemaPath: "/v1/tenants" })
      );

      expect(mockRefreshSession).toHaveBeenCalledTimes(1);
      expect(setToken).toHaveBeenCalledWith("new-token");
      expect(fetch).toHaveBeenCalledTimes(1);

      const [call] = fetch.mock.calls;
      if (!call) {
        throw new Error("Expected fetch to be called with a retry request");
      }
      const retryRequest = call[0] as Request;
      expect(retryRequest.headers.get("Authorization")).toBe("Bearer new-token");
      expect(retryRequest.headers.get("X-Silent-Refresh-Retry")).toBe("1");
      expect(result).toBe(retryResponse);
      expect(clearSession).not.toHaveBeenCalled();
    });

    it("clears the session and redirects to login when refresh fails", async () => {
      const setToken = vi.fn();
      const clearSession = vi.fn();
      mockGetState.mockReturnValue({
        accessToken: "old-token",
        setToken,
        clearSession,
      });
      mockRefreshSession.mockRejectedValue(new Error("refresh failed"));

      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        writable: true,
        value: { href: "" },
      });

      const request = new Request("http://localhost/v1/tenants");
      const response = new Response(null, { status: 401 });

      const result = await invokeOnResponse(
        createParams({ request, response, schemaPath: "/v1/tenants" })
      );

      expect(clearSession).toHaveBeenCalled();
      expect(window.location.href).toBe("/login");
      expect(setToken).not.toHaveBeenCalled();
      expect(result).toBe(response);

      Object.defineProperty(window, "location", {
        writable: true,
        value: originalLocation,
      });
    });

    it("does not refresh for the refresh endpoint itself", async () => {
      mockGetState.mockReturnValue({
        accessToken: "old-token",
        setToken: vi.fn(),
        clearSession: vi.fn(),
      });

      const request = new Request("http://localhost/v1/auth/refresh");
      const response = new Response(null, { status: 401 });

      const result = await invokeOnResponse(
        createParams({ request, response, schemaPath: "/v1/auth/refresh" })
      );

      expect(mockRefreshSession).not.toHaveBeenCalled();
      expect(result).toBe(response);
    });

    it("deduplicates concurrent refresh attempts", async () => {
      const setToken = vi.fn();
      const clearSession = vi.fn();
      mockGetState.mockReturnValue({
        accessToken: "old-token",
        setToken,
        clearSession,
      });

      let resolveRefresh: ((value: string) => void) | undefined;
      mockRefreshSession.mockImplementation(
        () =>
          new Promise<string>((resolve) => {
            resolveRefresh = resolve;
          })
      );

      const fetch = vi.fn<typeof globalThis.fetch>();
      const response = new Response(null, { status: 401 });

      const first = invokeOnResponse(
        createParams({
          request: new Request("http://localhost/v1/tenants"),
          response,
          options: { fetch },
          schemaPath: "/v1/tenants",
        })
      );
      const second = invokeOnResponse(
        createParams({
          request: new Request("http://localhost/v1/admins"),
          response,
          options: { fetch },
          schemaPath: "/v1/admins",
        })
      );

      expect(mockRefreshSession).toHaveBeenCalledTimes(1);

      if (!resolveRefresh) {
        throw new Error("Expected refreshSession to have started");
      }
      resolveRefresh("shared-token");

      const [firstResult, secondResult] = await Promise.all([first, second]);

      expect(setToken).toHaveBeenCalledWith("shared-token");
      expect(fetch).toHaveBeenCalledTimes(2);

      const [firstCall, secondCall] = fetch.mock.calls;
      if (!firstCall || !secondCall) {
        throw new Error("Expected both retry requests to be fetched");
      }
      const firstRetry = firstCall[0] as Request;
      const secondRetry = secondCall[0] as Request;
      expect(firstRetry.headers.get("Authorization")).toBe("Bearer shared-token");
      expect(secondRetry.headers.get("Authorization")).toBe("Bearer shared-token");

      const [firstResultRecord, secondResultRecord] = fetch.mock.results;
      if (!firstResultRecord || !secondResultRecord) {
        throw new Error("Expected fetch results for both retry requests");
      }
      expect(firstResult).toBe(await firstResultRecord.value);
      expect(secondResult).toBe(await secondResultRecord.value);
    });
  });
});
