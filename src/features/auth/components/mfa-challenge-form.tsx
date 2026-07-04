"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";

import { mfaSchema, type MfaInput } from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";
import { FingerprintIcon, LockIcon, ShieldIcon } from "./icons";
import { OtpInput } from "./otp-input";

export interface MfaChallengeSubmitInput extends MfaInput {
  mfa_token: string;
}

export interface MfaChallengeFormProps {
  mfaToken: string;
  onSubmit: (values: MfaChallengeSubmitInput) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function MfaChallengeForm({
  mfaToken,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: MfaChallengeFormProps) {
  const submittedCodeRef = useRef<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaInput>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      code: "",
    },
  });
  const submit = handleSubmit((values) => onSubmit({ ...values, mfa_token: mfaToken }));

  const submitCompleteCode = (code: string) => {
    if (code.length !== 6 || isLoading || submittedCodeRef.current === code) return;

    submittedCodeRef.current = code;
    void onSubmit({ code, mfa_token: mfaToken });
  };

  return (
    <form
      className={cn("flex flex-col items-center", className)}
      aria-busy={isLoading}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        void submit(event);
      }}
    >
      <fieldset className="contents" disabled={isLoading}>
        <div className="flex h-[88px] w-16 flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e2dfff]">
            <ShieldIcon className="h-[33px] w-[27px] text-[#1e00a9]" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
            Two-Factor Verification
          </h1>
          <p className="mt-1 pb-8 text-sm leading-5 text-[#464555]">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <div className="w-full pb-6">
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={(code) => {
                  field.onChange(code);
                  submitCompleteCode(code);
                }}
                disabled={isLoading}
              />
            )}
          />
          {errors.code?.message ? (
            <p className="mt-2 text-center text-xs leading-4 text-[#93000a]">
              {errors.code.message}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-base leading-6 text-[#464555]">
              <span aria-hidden="true">◷</span>
              <span>Code expires in 01:52</span>
            </div>
            <button
              type="button"
              disabled
              className="text-base leading-6 text-[#777587] opacity-50 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </div>

          <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-[#f0f3ff] p-4">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#c7c4d8] bg-white text-[#1e00a9] focus-visible:ring-[#1e00a9] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            />
            <span className="text-base leading-6 text-[#464555]">
              Trust this device for 30 days
            </span>
          </label>

          <div className="flex w-full flex-col items-start gap-2 pt-4">
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(199,196,216,0.3)] bg-[#dce3f2] px-4 py-[17px] text-center text-base leading-6 text-[#151c27] transition-colors hover:bg-[#cbd6ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FingerprintIcon className="h-[19px] w-[19px]" />
              Alternative: Use WebAuthn / Security Key
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full px-4 py-2 text-center text-base leading-6 text-[#464555] transition-colors hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel and Return to Login
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 pt-8 text-base uppercase leading-6 tracking-[1.6px] text-[#777587]">
          <LockIcon className="h-3 w-3" />
          <span>End-to-End Encrypted Session</span>
        </div>
      </fieldset>
    </form>
  );
}
