"use client";

import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { ErrorBanner } from "@/features/auth/components/error-banner";
import { KeyIcon } from "@/features/auth/components/icons";
import { PasswordField } from "@/features/auth/components/password-field";
import { PasswordStrengthMeter } from "@/features/auth/components/password-strength-meter";
import { TopAppBar } from "@/features/auth/components/top-app-bar";
import { ValidationChecklist } from "@/features/auth/components/validation-checklist";

export default function CreatePasswordPage() {
  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6">
        <div className="flex w-full max-w-[448px] flex-col gap-4">
          <ErrorBanner
            title="Invalid or expired link"
            message="Please request a new password reset link if you continue to see this error."
            onDismiss={() => undefined}
          />

          <AuthCard className="w-full">
            <form
              className="flex flex-col items-center gap-8"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
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

              <div className="flex w-full flex-col gap-4">
                <PasswordField
                  label="New Password"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  inputSize="large"
                />

                <PasswordStrengthMeter strength={2} />

                <ValidationChecklist
                  items={[
                    { label: "At least 12 characters", valid: true },
                    { label: "One uppercase letter", valid: true },
                    { label: "One number or special character", valid: false },
                    { label: "No commonly used passwords", valid: false },
                  ]}
                />

                <PasswordField
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  inputSize="large"
                />
              </div>

              <AuthButton type="submit" size="large">
                Update Password and Login
              </AuthButton>
            </form>
          </AuthCard>
        </div>
      </main>

      <AuthFooter />
    </AtmosphericBackground>
  );
}
