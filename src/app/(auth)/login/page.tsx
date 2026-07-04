"use client";

import { useState } from "react";

import { AuthBrandingHeader } from "@/features/auth/components/auth-branding-header";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { ShieldIcon } from "@/features/auth/components/icons";
import { LoginForm } from "@/features/auth/components/login-form";
import { MfaChallengeForm } from "@/features/auth/components/mfa-challenge-form";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useVerifyMfa } from "@/features/auth/hooks/use-verify-mfa";

export default function LoginPage() {
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const login = useLogin({
    onMfaRequired: setMfaToken,
  });
  const verifyMfa = useVerifyMfa();

  if (mfaToken) {
    return (
      <AtmosphericBackground>
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[rgba(199,196,216,0.3)] bg-[rgba(255,255,255,0.95)] px-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur-[6px]">
          <p className="text-4xl font-bold leading-[44px] tracking-[-0.72px] text-[#1e00a9]">
            HROS Admin
          </p>
          <div className="flex items-center gap-4" aria-hidden="true">
            <span className="h-4 w-4 rounded-full" />
            <span className="h-4 w-4 rounded-full" />
          </div>
        </header>

        <main className="flex min-h-screen w-full items-center justify-center px-4 pb-32 pt-48 sm:px-6">
          <AuthCard className="w-full max-w-[480px]" softShadow>
            <MfaChallengeForm
              mfaToken={mfaToken}
              onSubmit={(values) => {
                verifyMfa.mutate(values);
              }}
              onCancel={() => {
                setMfaToken(null);
              }}
              isLoading={verifyMfa.isPending}
            />
          </AuthCard>
        </main>

        <footer className="flex w-full flex-col items-center justify-center gap-4 px-4 py-8 text-center text-[#464555] sm:flex-row">
          <p className="text-sm leading-5">© 2024 HROS Admin. All sessions are encrypted.</p>
          <nav className="flex items-center gap-6" aria-label="MFA verification footer">
            {["Support", "Terms", "Privacy"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => undefined}
                className="text-base leading-6 transition-colors hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
              >
                {label}
              </button>
            ))}
          </nav>
        </footer>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground>
      <main className="flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-[1280px] items-center justify-center gap-12">
          {/* Main auth column */}
          <div className="flex w-full flex-col items-center sm:max-w-[448px]">
            <AuthBrandingHeader
              className="mb-8"
              subtitle="SECURE SUPER ADMIN PORTAL ACCESS"
              mobileSubtitle="Administrative Control Gateway"
            />

            <AuthCard className="w-full sm:w-[416px]">
              <LoginForm
                onSubmit={(values) => {
                  login.mutate(values);
                }}
                isLoading={login.isPending}
              />
            </AuthCard>

            <p className="mt-6 text-center text-sm leading-5 text-[#777587]">
              Need help?{" "}
              <button
                type="button"
                onClick={() => undefined}
                className="font-semibold text-[#1e00a9] transition-colors hover:text-[#3525cd] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
              >
                Contact IT Support
              </button>
            </p>
          </div>

          {/* Desktop decorative panel */}
          <div className="relative hidden h-[520px] w-[416px] flex-col items-center justify-center rounded-xl border border-[#e5e7eb] bg-white/40 opacity-40 lg:flex">
            <div className="flex flex-col items-center gap-6 p-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#e2dfff]">
                <ShieldIcon className="h-12 w-12 text-[#1e00a9]" />
              </div>
              <div>
                <p className="text-2xl font-semibold leading-8 tracking-[-0.28px] text-[#151c27]">
                  Zero-Trust Verified
                </p>
                <p className="mt-2 text-base leading-6 text-[#464555]">
                  Your session is protected by enterprise-grade security controls and continuous
                  identity verification.
                </p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full border border-[rgba(199,196,216,0.5)] bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#006c49]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[#151c27]">Zero-Trust Verified</span>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </AtmosphericBackground>
  );
}
