"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import {
  passwordResetRequestSchema,
  type PasswordResetRequestInput,
} from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";
import { AuthButton } from "./auth-button";
import { AuthInput } from "./auth-input";
import { ArrowRightIcon, MailIcon } from "./icons";

export interface ForgotPasswordFormProps {
  onSubmit: SubmitHandler<PasswordResetRequestInput>;
  isLoading?: boolean;
  className?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  isLoading = false,
  className,
}: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
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
        <AuthInput
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          leftIcon={<MailIcon className="h-5 w-5" />}
          error={errors.email?.message ?? ""}
          {...register("email")}
        />

        <AuthButton
          type="submit"
          size="default"
          isLoading={isLoading}
          disabled={isLoading}
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Send Reset Link
        </AuthButton>
      </fieldset>
    </form>
  );
}
