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
import { ArrowRightIcon } from "./icons";
import { PasswordField } from "./password-field";

export interface ResetPasswordFormProps {
  onSubmit: SubmitHandler<PasswordResetFormInput>;
  isLoading?: boolean;
  passwordError?: string;
  className?: string;
}

export function ResetPasswordForm({
  onSubmit,
  isLoading = false,
  passwordError = "",
  className,
}: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordResetFormInput>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });
  const submit = handleSubmit(onSubmit);
  const password = watch("password");
  const passwordErrorMessage = errors.password?.message ?? passwordError;
  const strength = getPasswordStrength(password);

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
            placeholder="Enter at least 10 characters"
            autoComplete="new-password"
            inputSize="large"
            error={passwordErrorMessage}
            {...register("password")}
          />

          <PasswordStrengthMeter strength={strength} />
          <PasswordRequirementList password={password} />

          <PasswordField
            label="Confirm Password"
            placeholder="Repeat your new password"
            autoComplete="new-password"
            inputSize="large"
            error={errors.password_confirmation?.message ?? ""}
            {...register("password_confirmation")}
          />
        </div>

        <AuthButton
          type="submit"
          size="large"
          isLoading={isLoading}
          disabled={isLoading}
          className="mt-4 text-base sm:text-xl"
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Update Password and Login
        </AuthButton>
      </fieldset>
    </form>
  );
}

interface PasswordStrength {
  score: number;
  label: "NONE" | "WEAK" | "MEDIUM" | "STRONG";
}

function getPasswordStrength(password = ""): PasswordStrength {
  const checks = getPasswordChecks(password);
  const score = checks.filter((check) => check.met).length;

  if (!password) return { score: 0, label: "NONE" };
  if (score <= 1) return { score: 1, label: "WEAK" };
  if (score <= 3) return { score: 3, label: "MEDIUM" };
  return { score: 4, label: "STRONG" };
}

function getPasswordChecks(password = "") {
  return [
    { label: "Minimum 10 characters", met: password.length >= 10 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

function PasswordStrengthMeter({ strength }: { strength: PasswordStrength }) {
  return (
    <div className="flex w-full flex-col gap-1 px-1" aria-label="Password strength">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.55px] text-[#464555]">
          Strength
        </span>
        <span className="text-[11px] font-bold leading-[14px] text-[#777587]">
          {strength.label}
        </span>
      </div>
      <div className="flex h-1.5 w-full gap-1 rounded-full bg-[#e2e8f8]">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "min-w-0 flex-1 rounded-full",
              step <= strength.score ? "bg-[#1e00a9]" : "bg-[#c7c4d8]"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function PasswordRequirementList({ password }: { password: string }) {
  const checks = getPasswordChecks(password);

  return (
    <div className="rounded-lg border border-[rgba(199,196,216,0.3)] bg-[rgba(240,243,255,0.5)] p-4">
      <ul className="flex flex-col gap-1">
        {checks.map((check) => (
          <li
            key={check.label}
            className="flex items-center gap-2 text-sm leading-5 text-[#464555]"
          >
            <span
              className={cn(
                "h-[15px] w-[15px] rounded-full border",
                check.met ? "border-[#1e00a9] bg-[#1e00a9]" : "border-[#777587]"
              )}
              aria-hidden="true"
            />
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
