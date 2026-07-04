"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { LoginInput } from "@/features/auth/schemas/auth.schema";
import { authService, type LoginResponse } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";

export function useLogin() {
  const router = useRouter();
  const toast = useToast();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: (values) => authService.login(values),
    onSuccess: (response) => {
      if (response.access_token) {
        setToken(response.access_token);
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      if (error.code === "ACCOUNT_LOCKED") {
        toast.error("Account locked", "Your account is locked. Contact an administrator for help.");
        return;
      }

      toast.error("Invalid email or password");
    },
  });
}
