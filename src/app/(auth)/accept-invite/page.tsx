"use client";

import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import {
  BuildingIcon,
  ArrowRightIcon,
  ShieldIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/features/auth/components/icons";
import { PasswordField } from "@/features/auth/components/password-field";
import { TopAppBar } from "@/features/auth/components/top-app-bar";
import * as React from "react";

export default function AcceptInvitePage() {
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-[104.5px] pt-[152.5px] sm:px-6">
        <AuthCard className="w-full max-w-[540px]">
          <form
            className="flex flex-col items-center gap-6"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7eefe]">
              <BuildingIcon className="h-8 w-8 text-[#1e00a9]" />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
                You have been invited to join Acme Corp Global
              </h1>
              <p className="mt-1 text-sm leading-5 text-[#464555]">
                Administrative invitation for the HROS secure environment.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 rounded-lg bg-[#f0f3ff] p-[17px] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2dfff]">
                  <span className="text-base font-semibold text-[#0f0069]">AR</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase leading-4 tracking-[0.6px] text-[#777587]">
                    Email Address
                  </p>
                  <p className="text-base font-semibold leading-6 text-[#1e00a9]">
                    alex.r@acmecorp.com
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center rounded-full bg-[#9af2c5] px-3 py-1 text-xs font-semibold leading-4 text-[#0c714d]">
                  Super Admin
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              <PasswordField
                label="Create new password"
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <AuthInput
                label="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
                leftIcon={<ShieldIcon className="h-5 w-5" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#777587] transition-colors hover:bg-[#f0f3ff] hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                }
              />
            </div>

            <AuthButton
              type="submit"
              size="large"
              rightIcon={<ArrowRightIcon className="h-4 w-4" />}
            >
              Accept Invitation & Create Account
            </AuthButton>

            <div className="w-full border-t border-[rgba(199,196,216,0.5)] pt-[17px] text-center">
              <p className="text-[11px] leading-4 text-[#777587]">
                By accepting this invitation, you agree to the{" "}
                <a
                  href="/enterprise-security-policy"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="font-semibold text-[#1e00a9] underline-offset-4 transition-colors hover:text-[#3525cd] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
                >
                  Enterprise Security Policy
                </a>
                .
              </p>
              <p className="mt-2 text-xs font-semibold leading-4 text-[#006c49]">
                End-to-End Encrypted Provisioning
              </p>
            </div>
          </form>
        </AuthCard>
      </main>

      <AuthFooter />
    </AtmosphericBackground>
  );
}
