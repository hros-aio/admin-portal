"use client";

import { AuthButton } from "@/features/auth/components/auth-button";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { HrosLogo } from "@/features/auth/components/icons";

export default function SsoTransitionPage() {
  return (
    <AtmosphericBackground variant="sso">
      <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="flex w-full max-w-[448px] flex-col items-center gap-6">
          <div className="flex h-[340px] w-full flex-col items-center justify-center gap-6 rounded-xl border border-[#e5e7eb] bg-[rgba(255,255,255,0.95)] p-8 shadow-[0_10px_15px_-3px_rgba(30,0,169,0.1),0_4px_6px_-4px_rgba(30,0,169,0.1)] backdrop-blur-[5px]">
            <div className="relative">
              <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-[#e2dfff]">
                <HrosLogo className="h-10 w-10" />
              </div>
              <div className="absolute inset-0 rounded-full bg-[#1e00a9]/10" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-semibold leading-7 tracking-[-0.5px] text-[#151c27]">
                Signing you in securely...
              </h1>
              <p className="mt-2 text-sm leading-5 text-[#464555]">
                Redirecting to your identity provider
              </p>
            </div>

            <div className="w-full">
              <div
                className="h-[6px] w-full overflow-hidden rounded-full bg-[#e7eefe]"
                role="progressbar"
                aria-valuenow={65}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Sign-in progress"
              >
                <div
                  className="h-full rounded-full bg-[#1e00a9] shadow-[0_0_8px_rgba(30,0,169,0.3)] transition-all duration-500"
                  style={{ width: "65%" }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs leading-4 text-[#777587]" aria-live="polite">
                  Verifying session...
                </span>
                <span className="text-xs font-semibold leading-4 text-[#1e00a9]" aria-live="polite">
                  65%
                </span>
              </div>
            </div>
          </div>

          <AuthButton
            type="button"
            variant="secondary"
            size="compact"
            className="rounded-full"
            onClick={() => undefined}
          >
            Cancel
          </AuthButton>
        </div>

        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(199,196,216,0.5)] bg-white/90 px-4 py-2 text-xs text-[#777587] shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006c49]" aria-hidden="true" />
            Secure terminal connection
          </div>
        </div>
      </main>
    </AtmosphericBackground>
  );
}
