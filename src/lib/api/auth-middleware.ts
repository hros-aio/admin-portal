import type { Middleware } from "openapi-fetch";

import { ROUTES } from "@/constants/routes";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";

const REFRESH_RETRY_HEADER = "X-Silent-Refresh-Retry";

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = authService
      .refreshSession()
      .then((token) => {
        refreshPromise = null;
        return token;
      })
      .catch((error: unknown) => {
        refreshPromise = null;
        throw error;
      });
  }

  try {
    return await refreshPromise;
  } catch {
    return null;
  }
}

function isPublicAuthRequest(schemaPath: string): boolean {
  return schemaPath === "/v1/auth/login" || schemaPath === "/v1/auth/refresh";
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = ROUTES.login();
  }
}

export const authMiddleware: Middleware = {
  onRequest({ request, schemaPath }) {
    if (isPublicAuthRequest(schemaPath)) {
      return request;
    }

    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return request;
  },
  async onResponse({ request, response, options, schemaPath }) {
    if (response.status !== 401) {
      return response;
    }

    if (request.headers.has(REFRESH_RETRY_HEADER)) {
      return response;
    }

    if (isPublicAuthRequest(schemaPath)) {
      return response;
    }

    const newToken = await refreshAccessToken();

    if (!newToken) {
      useAuthStore.getState().clearSession();
      redirectToLogin();
      return response;
    }

    useAuthStore.getState().setToken(newToken);

    const retryRequest = request.clone();
    retryRequest.headers.set("Authorization", `Bearer ${newToken}`);
    retryRequest.headers.set(REFRESH_RETRY_HEADER, "1");

    return options.fetch(retryRequest);
  },
};
