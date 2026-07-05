"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AcceptInviteInput } from "@/features/auth/schemas/auth.schema";
import {
  authService,
  type AcceptInviteRequest,
  type AcceptInviteResponse,
} from "@/features/auth/services/auth.service";
import type { ApiError } from "@/lib/api/result";
import { useToast } from "@/lib/toast";

export type AcceptInviteError = "expired" | "used" | "weak-password" | "unknown";

function mapAcceptInviteError(error: ApiError): AcceptInviteError {
  if (error.code === "INVITE_EXPIRED") return "expired";
  if (error.code === "INVITE_USED") return "used";
  if (error.code === "PASSWORD_WEAK") return "weak-password";
  return "unknown";
}

export function useAcceptInvite() {
  const router = useRouter();
  const toast = useToast();
  const [inviteError, setInviteError] = useState<AcceptInviteError | null>(null);

  const mutation = useMutation<AcceptInviteResponse, ApiError, AcceptInviteInput>({
    mutationFn: (values) => {
      const body: AcceptInviteRequest = {
        token: values.token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      };

      return authService.acceptInvite(body);
    },
    onMutate: () => {
      setInviteError(null);
    },
    onSuccess: () => {
      toast.success("Account activated", "You can now sign in with your administrator account.");
      router.push("/login");
    },
    onError: (error) => {
      const mappedError = mapAcceptInviteError(error);
      setInviteError(mappedError);

      if (mappedError === "weak-password") {
        toast.error("Password is too weak", "Choose a stronger password and try again.");
        return;
      }

      if (mappedError === "unknown") {
        toast.error("Unable to accept invitation", "Try again or contact your administrator.");
      }
    },
  });

  return {
    ...mutation,
    inviteError,
    clearInviteError: () => {
      setInviteError(null);
    },
  };
}
