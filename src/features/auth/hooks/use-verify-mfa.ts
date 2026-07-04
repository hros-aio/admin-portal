"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  authService,
  type LoginResponse,
  type VerifyMfaInput,
} from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";

export function useVerifyMfa() {
  const router = useRouter();
  const toast = useToast();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation<LoginResponse, ApiError, VerifyMfaInput>({
    mutationFn: (values) => authService.verifyMfa(values),
    onSuccess: (response) => {
      if (response.access_token) {
        setToken(response.access_token);
        router.push("/dashboard");
      }
    },
    onError: () => {
      toast.error("Invalid verification code", "Check the code and try again.");
    },
  });
}
