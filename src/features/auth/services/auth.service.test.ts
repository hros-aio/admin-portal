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

describe("authService", () => {
  describe("refreshSession", () => {
    it("returns the access token from a successful refresh", async () => {
      mockPost.mockResolvedValue({
        data: { access_token: "new-access-token" },
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.refreshSession()).resolves.toBe("new-access-token");
    });

    it("throws ApiError when the refresh endpoint returns an error", async () => {
      mockPost.mockResolvedValue({
        error: { code: "UNAUTHORIZED", message: "Session expired" },
        response: new Response(null, { status: 401 }),
      });

      await expect(authService.refreshSession()).rejects.toBeInstanceOf(ApiError);
    });

    it("throws ApiError when the response body omits the access token", async () => {
      mockPost.mockResolvedValue({
        data: {},
        response: new Response(null, { status: 200 }),
      });

      await expect(authService.refreshSession()).rejects.toBeInstanceOf(ApiError);
    });
  });
});
