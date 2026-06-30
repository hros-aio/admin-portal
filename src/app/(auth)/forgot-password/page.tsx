"use client";

import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { TopAppBar } from "@/features/auth/components/top-app-bar";
import { MailIcon } from "@/features/auth/components/icons";

export default function PasswordResetRequestPage() {
  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6">
        <AuthCard className="w-full max-w-[440px]">
          <form
            className="flex flex-col items-center gap-8"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
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

            <div className="w-full">
              <AuthInput
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                leftIcon={<MailIcon className="h-5 w-5" />}
              />
            </div>

            <div className="flex w-full flex-col gap-4">
              <AuthButton type="submit" size="default">
                Send Reset Link
              </AuthButton>

              <AuthButton type="button" variant="text" size="default" onClick={() => undefined}>
                Back to Login
              </AuthButton>
            </div>
          </form>
        </AuthCard>
      </main>

      <AuthFooter />
    </AtmosphericBackground>
  );
}
