import { v4 as uuidv4 } from "uuid";
import type { Middleware } from "openapi-fetch";

export const requestIdMiddleware: Middleware = {
  onRequest({ request }) {
    request.headers.set("X-Request-ID", uuidv4());
    return request;
  },
};
