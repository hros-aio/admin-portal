"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  PasswordResetFormInput,
  PasswordResetRequestInput,
} from "@/features/auth/schemas/auth.schema";
import {
  authService,
  type PasswordResetConfirmRequest,
  type PasswordResetConfirmResponse,
  type PasswordResetRequestResponse,
} from "@/features/auth/services/auth.service";
import type { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";

export const PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE =
  "If an account exists for that email, a reset link has been sent.";

export type PasswordResetConfirmInput = PasswordResetFormInput & {
  token: string;
};

export type PasswordResetError = "expired" | "used" | "weak-password" | "unknown";

function mapConfirmError(error: ApiError): PasswordResetError {
  if (error.code === "TOKEN_EXPIRED") return "expired";
  if (error.code === "TOKEN_USED") return "used";
  if (error.code === "PASSWORD_WEAK") return "weak-password";
  return "unknown";
}

export function useRequestPasswordReset() {
  const toast = useToast();

  return useMutation<PasswordResetRequestResponse, ApiError, PasswordResetRequestInput>({
    mutationFn: (values) => authService.requestPasswordReset(values),
    onSuccess: () => {
      toast.success("Check your email", PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE);
    },
    onError: () => {
      toast.error(
        "Unable to request reset",
        "Try again without changing the email address format."
      );
    },
  });
}

export function useConfirmPasswordReset() {
  const router = useRouter();
  const toast = useToast();
  const [resetError, setResetError] = useState<PasswordResetError | null>(null);

  const mutation = useMutation<PasswordResetConfirmResponse, ApiError, PasswordResetConfirmInput>({
    mutationFn: (values) => {
      const body: PasswordResetConfirmRequest = {
        token: values.token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      };

      return authService.confirmPasswordReset(body);
    },
    onMutate: () => {
      setResetError(null);
    },
    onSuccess: () => {
      toast.success("Password updated", "You can now sign in with your new password.");
      router.push("/login");
    },
    onError: (error) => {
      const mappedError = mapConfirmError(error);
      setResetError(mappedError);

      if (mappedError === "weak-password") {
        toast.error("Password is too weak", "Choose a stronger password and try again.");
        return;
      }

      if (mappedError === "unknown") {
        toast.error("Unable to reset password", "Try again or request a new reset link.");
      }
    },
  });

  return {
    ...mutation,
    resetError,
    clearResetError: () => {
      setResetError(null);
    },
  };
}
