import type { Middleware } from "openapi-fetch";

const CSRF_COOKIE_NAME = "csrf_token";
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getCsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${CSRF_COOKIE_NAME}=`));

  return match?.slice(CSRF_COOKIE_NAME.length + 1);
}

export const csrfMiddleware: Middleware = {
  onRequest({ request }) {
    if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) {
      return request;
    }

    const token = getCsrfToken();
    if (token) {
      request.headers.set("X-CSRF-Token", token);
    }

    return request;
  },
};
