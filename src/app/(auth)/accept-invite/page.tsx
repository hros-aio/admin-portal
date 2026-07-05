"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AcceptInviteForm } from "@/features/auth/components/accept-invite-form";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AtmosphericBackground } from "@/features/auth/components/atmospheric-background";
import { ErrorBanner } from "@/features/auth/components/error-banner";
import { BuildingIcon, ShieldIcon } from "@/features/auth/components/icons";
import { TopAppBar } from "@/features/auth/components/top-app-bar";
import { useAcceptInvite } from "@/features/auth/hooks/use-accept-invite";

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteContent />
    </Suspense>
  );
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";
  const acceptInvite = useAcceptInvite();
  const linkError = getLinkError(token, email, acceptInvite.inviteError);
  const passwordError =
    acceptInvite.inviteError === "weak-password" ? "Choose a stronger password and try again." : "";
  const unknownError =
    acceptInvite.inviteError === "unknown" ? "Try again or contact your administrator." : "";

  return (
    <AtmosphericBackground>
      <TopAppBar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-[104.5px] pt-[152.5px] sm:px-6">
        <div className="flex w-full max-w-[540px] flex-col gap-6">
          {linkError ? <ErrorBanner title={linkError.title} message={linkError.message} /> : null}

          {unknownError ? (
            <ErrorBanner title="Unable to accept invitation" message={unknownError} />
          ) : null}

          <AuthCard className="w-full max-w-[540px] gap-0 p-[33px]" softShadow>
            <div className="flex flex-col items-center gap-6">
              <div className="flex w-full flex-col items-center gap-4">
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
              </div>

              <InviteBadge email={email} />

              {token && email ? (
                <AcceptInviteForm
                  token={token}
                  onSubmit={(values) => {
                    acceptInvite.mutate(values);
                  }}
                  isLoading={acceptInvite.isPending}
                  passwordError={passwordError}
                />
              ) : null}

              <SecurityFooter />
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
  email: string,
  inviteError: ReturnType<typeof useAcceptInvite>["inviteError"]
) {
  if (!token || !email) {
    return {
      title: "Invalid invitation link",
      message: "Ask your administrator for a new invitation link to continue.",
    };
  }

  if (inviteError === "expired") {
    return {
      title: "Invitation expired",
      message: "This invitation has expired...",
    };
  }

  if (inviteError === "used") {
    return {
      title: "Invitation already used",
      message: "This invitation has already been used.",
    };
  }

  return null;
}

function InviteBadge({ email }: { email: string }) {
  const displayEmail = email || "Unknown email";
  const initials = getEmailInitials(email);

  return (
    <div className="w-full rounded-lg border border-[rgba(199,196,216,0.3)] bg-[#f0f3ff] p-[17px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e2dfff]">
            <span className="text-base font-bold leading-6 text-[#0f0069]">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase leading-4 tracking-[0.6px] text-[#151c27]">
              Email Address
            </p>
            <p className="truncate text-base font-semibold leading-6 text-[#1e00a9]">
              {displayEmail}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-[#9af2c5] px-4 py-1 text-xs font-semibold leading-4 tracking-[0.6px] text-[#0c714d]">
          Super Admin
        </span>
      </div>
    </div>
  );
}

function getEmailInitials(email: string) {
  const localPart = email.split("@")[0]?.trim();
  if (!localPart) return "--";

  const parts = localPart.split(/[._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

function SecurityFooter() {
  return (
    <div className="w-full border-t border-[rgba(199,196,216,0.2)] pt-[17px] text-center">
      <p className="text-[11px] font-medium leading-[14px] text-[#777587]">
        By accepting, you agree to the{" "}
        <a
          href="/enterprise-security-policy"
          onClick={(event) => {
            event.preventDefault();
          }}
          className="text-[#1e00a9] transition-colors hover:text-[#3525cd] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
        >
          Enterprise Security Policy.
        </a>
      </p>
      <p className="mt-4 inline-flex items-center justify-center gap-1 text-xs font-semibold leading-4 tracking-[0.6px] text-[#006c49]">
        <ShieldIcon className="h-3.5 w-3.5" />
        End-to-End Encrypted Provisioning
      </p>
    </div>
  );
}
