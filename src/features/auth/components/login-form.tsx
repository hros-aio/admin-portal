"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import type { BiometricLoginInput } from "@/features/auth/hooks/use-biometric-login";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";
import { AuthButton } from "./auth-button";
import { AuthInput } from "./auth-input";
import { ArrowRightIcon, FingerprintIcon, MailIcon } from "./icons";
import { PasswordField } from "./password-field";

export interface LoginFormProps {
  onSubmit: SubmitHandler<LoginInput>;
  onSsoLogin?: () => void;
  onBiometricLogin?: (values: BiometricLoginInput) => void;
  isLoading?: boolean;
  isBiometricLoading?: boolean;
  className?: string;
}

export function LoginForm({
  onSubmit,
  onSsoLogin,
  onBiometricLogin,
  isLoading = false,
  isBiometricLoading = false,
  className,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });
  const submit = handleSubmit(onSubmit);
  const isBusy = isLoading || isBiometricLoading;

  const handleBiometricLogin = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    const { email, remember_me } = getValues();
    onBiometricLogin?.({ email, remember_me });
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      aria-busy={isBusy}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        void submit(event);
      }}
    >
      <fieldset className="contents" disabled={isBusy}>
        <AuthInput
          label="Email"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          leftIcon={<MailIcon className="h-5 w-5" />}
          error={errors.email?.message ?? ""}
          {...register("email")}
        />

        <PasswordField
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message ?? ""}
          {...register("password")}
        />

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-[#c7c4d8] text-[#1e00a9] focus-visible:ring-[#1e00a9] disabled:cursor-not-allowed disabled:opacity-60"
            {...register("remember_me")}
          />
          <span className="text-sm leading-5 text-[#464555]">Keep me logged in for 30 days</span>
        </label>

        <AuthButton
          type="submit"
          size="large"
          isLoading={isLoading}
          disabled={isBusy}
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Sign In
        </AuthButton>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[rgba(199,196,216,0.5)]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#777587]">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-[rgba(199,196,216,0.5)]" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AuthButton
            type="button"
            variant="outline"
            size="default"
            disabled={isBusy}
            onClick={onSsoLogin}
          >
            Continue with SSO
          </AuthButton>
          <AuthButton
            type="button"
            variant="outline"
            size="default"
            leftIcon={<FingerprintIcon className="h-4 w-4" />}
            isLoading={isBiometricLoading}
            disabled={isBusy}
            onClick={() => {
              void handleBiometricLogin();
            }}
          >
            Use Biometrics
          </AuthButton>
        </div>
      </fieldset>
    </form>
  );
}
