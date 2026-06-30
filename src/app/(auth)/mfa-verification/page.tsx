"use client";

import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { OtpInput } from "@/features/auth/components/otp-input";
import { ShieldIcon } from "@/features/auth/components/icons";
import { TopAppBar } from "@/features/auth/components/top-app-bar";
import * as React from "react";

export default function MfaVerificationPage() {
  const [code, setCode] = React.useState("");
  const [trustDevice, setTrustDevice] = React.useState(false);

  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-32 pt-[192px] sm:px-6">
        <AuthCard className="w-full max-w-[480px]">
          <form
            className="flex flex-col items-center"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e2dfff]">
              <ShieldIcon className="h-8 w-8 text-[#1e00a9]" />
            </div>

            <div className="mt-6 text-center">
              <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
                Two-Factor Verification
              </h1>
              <p className="mt-1 text-sm leading-5 text-[#464555]">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>

            <div className="mt-8 w-full">
              <OtpInput value={code} onChange={setCode} />
            </div>

            <div className="mt-6 flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
              <p className="text-base leading-6 text-[#464555]">Code expires in 01:52</p>
              <button
                type="button"
                disabled
                className="text-base leading-6 text-[#777587] transition-colors hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend Code
              </button>
            </div>

            <label className="mt-4 flex w-full cursor-pointer items-start gap-3 rounded-lg bg-[#f0f3ff] p-4">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => {
                  setTrustDevice(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 rounded border-[#c7c4d8] text-[#1e00a9] focus-visible:ring-[#1e00a9]"
              />
              <span className="text-sm leading-5 text-[#464555]">
                Trust this device for 30 days
              </span>
            </label>

            <button
              type="button"
              className="mt-4 w-full rounded-full bg-[#dce3f2] px-4 py-2.5 text-center text-sm font-semibold leading-5 text-[#151c27] transition-colors hover:bg-[#c7d4e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
            >
              Alternative: Use WebAuthn / Security Key
            </button>

            <div className="mt-4 w-full">
              <AuthButton type="button" variant="text" size="default" onClick={() => undefined}>
                Cancel and Return to Login
              </AuthButton>
            </div>

            <p className="mt-8 text-center text-base font-semibold uppercase leading-6 tracking-[1.6px] text-[#777587]">
              End-to-End Encrypted Session
            </p>
          </form>
        </AuthCard>
      </main>

      <AuthFooter />
    </AtmosphericBackground>
  );
}
