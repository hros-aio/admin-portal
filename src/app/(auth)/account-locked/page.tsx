"use client";

import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { AlertTriangleIcon, LockIcon } from "@/features/auth/components/icons";
import { TopAppBar } from "@/features/auth/components/top-app-bar";

export default function AccountLockedPage() {
  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6">
        <AuthCard className="flex w-full max-w-[480px] flex-col items-center gap-8 sm:h-[622px]">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#e2dfff]">
              <LockIcon className="h-12 w-12 text-[#1e00a9]" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#ba1a1a]">
              <AlertTriangleIcon className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
              Account Temporarily Locked
            </h1>
            <p className="mt-3 text-base leading-6 text-[#464555]">
              Too many failed sign-in attempts. For your security, access has been temporarily
              disabled.
            </p>
          </div>

          <div className="w-full rounded-lg border border-[rgba(199,196,216,0.5)] bg-[#f0f3ff] p-5 text-center">
            <p className="text-sm leading-5 text-[#464555]">Try again in</p>
            <p
              className="mt-1 text-[36px] font-bold leading-[44px] text-[#1e00a9]"
              aria-live="polite"
            >
              14:59
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            <AuthButton type="button" size="large">
              Contact IT Support
            </AuthButton>

            <AuthButton type="button" variant="text" size="default" onClick={() => undefined}>
              Return to Login
            </AuthButton>
          </div>
        </AuthCard>
      </main>

      <AuthFooter securityLogId="HROS-AUTH-2024-06-30-001" />
    </AtmosphericBackground>
  );
}
