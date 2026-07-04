import createClient from "openapi-fetch";

import type { paths } from "@/types/api.generated";

import { authMiddleware } from "./auth-middleware";
import { csrfMiddleware } from "./csrf-middleware";
import { requestIdMiddleware } from "./request-id-middleware";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "").replace(/\/v1$/, "");
}

const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

export const rawClient = createClient<paths>({
  baseUrl,
});

rawClient.use(authMiddleware);
rawClient.use(requestIdMiddleware);
rawClient.use(csrfMiddleware);
