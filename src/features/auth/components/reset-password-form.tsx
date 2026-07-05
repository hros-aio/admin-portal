"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import {
  passwordResetFormSchema,
  type PasswordResetFormInput,
} from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";
import { AuthButton } from "./auth-button";
import { PasswordField } from "./password-field";

export interface ResetPasswordFormProps {
  onSubmit: SubmitHandler<PasswordResetFormInput>;
  isLoading?: boolean;
  className?: string;
}

export function ResetPasswordForm({
  onSubmit,
  isLoading = false,
  className,
}: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormInput>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <form
      className={cn("flex w-full flex-col gap-6", className)}
      aria-busy={isLoading}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        void submit(event);
      }}
    >
      <fieldset className="contents" disabled={isLoading}>
        <div className="flex w-full flex-col gap-4">
          <PasswordField
            label="New Password"
            placeholder="Enter new password"
            autoComplete="new-password"
            inputSize="large"
            error={errors.password?.message ?? ""}
            {...register("password")}
          />

          <PasswordField
            label="Confirm Password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            inputSize="large"
            error={errors.password_confirmation?.message ?? ""}
            {...register("password_confirmation")}
          />
        </div>

        <AuthButton type="submit" size="large" isLoading={isLoading} disabled={isLoading}>
          Update Password
        </AuthButton>
      </fieldset>
    </form>
  );
}
