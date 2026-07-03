import { ApiError } from "@/lib/api/result";
import { rawClient } from "@/lib/api/client";

export const authService = {
  /**
   * Refresh the access token using the backend's refresh token cookie.
   * @returns The new access token.
   * @throws {ApiError} when the refresh endpoint returns an error or no token.
   */
  async refreshSession(): Promise<string> {
    const { data, error, response } = await rawClient.POST("/v1/auth/refresh", {
      body: { refresh_token: "" },
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    const accessToken = data.access_token;

    if (!accessToken) {
      throw new ApiError(status, {
        code: "EMPTY_RESPONSE",
        message: "Refresh response did not contain an access token.",
      });
    }

    return accessToken;
  },
};
