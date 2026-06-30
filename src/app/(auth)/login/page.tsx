"use client";

import { AuthBrandingHeader } from "@/features/auth/components/auth-branding-header";
import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { PasswordField } from "@/features/auth/components/password-field";
import {
  ArrowRightIcon,
  FingerprintIcon,
  MailIcon,
  ScanFaceIcon,
  ShieldIcon,
} from "@/features/auth/components/icons";

export default function LoginPage() {
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
              <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <AuthInput
                  label="Work Email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  leftIcon={<MailIcon className="h-5 w-5" />}
                />

                <PasswordField
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#c7c4d8] text-[#1e00a9] focus-visible:ring-[#1e00a9]"
                      onChange={() => undefined}
                    />
                    <span className="text-sm leading-5 text-[#464555]">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => undefined}
                    className="text-sm font-semibold text-[#1e00a9] transition-colors hover:text-[#3525cd] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>

                <AuthButton
                  type="submit"
                  size="large"
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

                <div className="grid grid-cols-3 gap-3">
                  <AuthButton
                    type="button"
                    variant="outline"
                    size="compact"
                    leftIcon={<span className="text-sm font-semibold">SSO</span>}
                    onClick={() => undefined}
                  >
                    SSO
                  </AuthButton>
                  <AuthButton
                    type="button"
                    variant="outline"
                    size="compact"
                    leftIcon={<FingerprintIcon className="h-4 w-4" />}
                    onClick={() => undefined}
                  >
                    Bio
                  </AuthButton>
                  <AuthButton
                    type="button"
                    variant="outline"
                    size="compact"
                    leftIcon={<ScanFaceIcon className="h-4 w-4" />}
                    onClick={() => undefined}
                  >
                    Face
                  </AuthButton>
                </div>
              </form>
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
