"use client";

import { AuthBrandingHeader } from "@/features/auth/components/auth-branding-header";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { ShieldIcon } from "@/features/auth/components/icons";
import { LoginForm } from "@/features/auth/components/login-form";
import { useLogin } from "@/features/auth/hooks/use-login";

export default function LoginPage() {
  const login = useLogin();

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
