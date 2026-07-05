"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { ErrorBanner } from "@/features/auth/components/error-banner";
import { KeyIcon } from "@/features/auth/components/icons";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { TopAppBar } from "@/features/auth/components/top-app-bar";
import { useConfirmPasswordReset } from "@/features/auth/hooks/use-password-reset";

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={null}>
      <CreatePasswordContent />
    </Suspense>
  );
}

function CreatePasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const confirmPasswordReset = useConfirmPasswordReset();
  const linkError = getLinkError(token, confirmPasswordReset.resetError);
  const passwordError =
    confirmPasswordReset.resetError === "weak-password"
      ? "Choose a stronger password and try again."
      : "";
  const unknownError =
    confirmPasswordReset.resetError === "unknown" ? "Try again or request a new reset link." : "";

  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-[88px] sm:px-6">
        <div className="flex w-full max-w-[448px] flex-col gap-6">
          {linkError ? <ErrorBanner title={linkError.title} message={linkError.message} /> : null}

          {unknownError ? (
            <ErrorBanner title="Unable to reset password" message={unknownError} />
          ) : null}

          <AuthCard className="w-full">
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e2dfff]">
                  <KeyIcon className="h-7 w-7 text-[#1e00a9]" />
                </div>

                <div className="text-center">
                  <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.28px] text-[#151c27]">
                    Create New Password
                  </h1>
                  <p className="mt-1 max-w-[320px] text-sm leading-5 text-[#464555]">
                    Protect your HROS Admin access with a strong, unique password.
                  </p>
                </div>
              </div>

              {token ? (
                <ResetPasswordForm
                  onSubmit={(values) => {
                    confirmPasswordReset.mutate({
                      token,
                      ...values,
                    });
                  }}
                  isLoading={confirmPasswordReset.isPending}
                  passwordError={passwordError}
                />
              ) : null}
            </div>
          </AuthCard>
        </div>
      </main>

      <AuthFooter showBrand variant="figma" />
    </AtmosphericBackground>
  );
}

function getLinkError(
  token: string,
  resetError: ReturnType<typeof useConfirmPasswordReset>["resetError"]
) {
  if (!token) {
    return {
      title: "Invalid reset link",
      message: "Request a new password reset link to continue.",
    };
  }

  if (resetError === "expired") {
    return {
      title: "Reset link expired",
      message: "Request a new password reset link to continue.",
    };
  }

  if (resetError === "used") {
    return {
      title: "Reset link already used",
      message: "Request a new password reset link to continue.",
    };
  }

  return null;
}
