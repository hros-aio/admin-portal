"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { acceptInviteSchema, type AcceptInviteInput } from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";
import { AuthButton } from "./auth-button";
import { ArrowRightIcon } from "./icons";
import { PasswordField } from "./password-field";

export interface AcceptInviteFormProps {
  token: string;
  onSubmit: SubmitHandler<AcceptInviteInput>;
  isLoading?: boolean;
  passwordError?: string;
  className?: string;
}

export function AcceptInviteForm({
  token,
  onSubmit,
  isLoading = false,
  passwordError = "",
  className,
}: AcceptInviteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      token,
      password: "",
      password_confirmation: "",
    },
  });
  const submit = handleSubmit(onSubmit);
  const passwordErrorMessage = errors.password?.message ?? passwordError;

  return (
    <form
      className={cn("flex w-full flex-col gap-4", className)}
      aria-busy={isLoading}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        void submit(event);
      }}
    >
      <fieldset className="contents" disabled={isLoading}>
        <input type="hidden" {...register("token")} />

        <div className="flex w-full flex-col gap-4">
          <PasswordField
            label="Create New Password"
            placeholder="Min. 12 characters"
            autoComplete="new-password"
            error={passwordErrorMessage}
            {...register("password")}
          />

          <PasswordField
            label="Confirm Password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.password_confirmation?.message ?? ""}
            {...register("password_confirmation")}
          />
        </div>

        <AuthButton
          type="submit"
          size="large"
          isLoading={isLoading}
          disabled={isLoading}
          className="mt-2 text-base sm:text-xl"
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Accept Invitation & Create Account
        </AuthButton>
      </fieldset>
    </form>
  );
}
