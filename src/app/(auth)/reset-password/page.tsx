"use client";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { KeyIcon } from "@/features/auth/components/icons";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { TopAppBar } from "@/features/auth/components/top-app-bar";

export default function CreatePasswordPage() {
  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6">
        <AuthCard className="w-full max-w-[448px]">
          <div className="flex flex-col items-center gap-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e2dfff]">
              <KeyIcon className="h-7 w-7 text-[#1e00a9]" />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
                Create New Password
              </h1>
              <p className="mt-2 text-sm leading-5 text-[#464555]">
                Your new password must be different from previously used passwords.
              </p>
            </div>

            <ResetPasswordForm onSubmit={() => undefined} />
          </div>
        </AuthCard>
      </main>

      <AuthFooter />
    </AtmosphericBackground>
  );
}
