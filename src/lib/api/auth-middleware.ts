import type { Middleware } from "openapi-fetch";

import { useAuthStore } from "@/features/auth/stores/auth-store";

export const authMiddleware: Middleware = {
  onRequest({ request }) {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return request;
  },
};
