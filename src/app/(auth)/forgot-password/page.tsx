"use client";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { MailIcon } from "@/features/auth/components/icons";
import { TopAppBar } from "@/features/auth/components/top-app-bar";

export default function PasswordResetRequestPage() {
  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6">
        <AuthCard className="w-full max-w-[440px]">
          <div className="flex flex-col items-center gap-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e2dfff]">
              <MailIcon className="h-8 w-8 text-[#1e00a9]" />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
                Reset Your Password
              </h1>
              <p className="mt-2 text-sm leading-5 text-[#464555]">
                Enter your work email and we’ll send you a secure link to create a new password.
              </p>
            </div>

            <ForgotPasswordForm onSubmit={() => undefined} />
          </div>
        </AuthCard>
      </main>

      <AuthFooter />
    </AtmosphericBackground>
  );
}
