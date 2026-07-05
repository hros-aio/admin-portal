"use client";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { ArrowLeftIcon, MailIcon } from "@/features/auth/components/icons";
import { TopAppBar } from "@/features/auth/components/top-app-bar";
import {
  PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE,
  useRequestPasswordReset,
} from "@/features/auth/hooks/use-password-reset";

export default function PasswordResetRequestPage() {
  const requestPasswordReset = useRequestPasswordReset();

  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6">
        <AuthCard className="w-full max-w-[440px]">
          <div className="flex flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e2dfff] shadow-sm">
              <MailIcon className="h-8 w-8 text-[#1e00a9]" />
            </div>

            <div className="mb-8 max-w-[320px] text-center">
              <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
                Reset Your Password
              </h1>
              <p className="mt-2 text-sm leading-5 text-[#464555]">
                Enter your work email and we will send a secure recovery link.
              </p>
            </div>

            {requestPasswordReset.isSuccess ? (
              <p
                className="rounded-lg border border-[rgba(30,0,169,0.16)] bg-[#f0f3ff] px-4 py-3 text-sm leading-5 text-[#151c27]"
                role="status"
              >
                {PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE}
              </p>
            ) : null}

            <ForgotPasswordForm
              onSubmit={(values) => {
                requestPasswordReset.mutate(values);
              }}
              isLoading={requestPasswordReset.isPending}
            />

            <a
              href="/login"
              className="mt-8 inline-flex items-center gap-1 text-xs font-semibold leading-4 tracking-[0.6px] text-[#464555] transition-colors hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
            >
              <ArrowLeftIcon className="h-3 w-3" />
              Back to Login
            </a>
          </div>
        </AuthCard>
      </main>

      <AuthFooter variant="figma" />
    </AtmosphericBackground>
  );
}
