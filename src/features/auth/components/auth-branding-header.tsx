import { cn } from "@/lib/utils";
import { HrosLogo } from "./icons";

interface AuthBrandingHeaderProps {
  className?: string;
  subtitle?: string;
  mobileSubtitle?: string;
}

export function AuthBrandingHeader({
  className,
  subtitle = "SECURE SUPER ADMIN PORTAL ACCESS",
  mobileSubtitle,
}: AuthBrandingHeaderProps) {
  const desktopSubtitle = subtitle;
  const effectiveMobileSubtitle = mobileSubtitle ?? subtitle;

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="mb-4 flex items-center gap-2">
        <HrosLogo className="h-[27px] w-[27px] sm:h-[33px] sm:w-[33px]" />
        <span
          className="text-[36px] font-bold leading-[44px] text-[#1e00a9]"
          style={{ letterSpacing: "-0.72px" }}
        >
          HROS Admin
        </span>
      </div>

      <p className="text-xs font-semibold uppercase leading-4 tracking-[1.2px] text-[#777587] sm:hidden">
        {effectiveMobileSubtitle}
      </p>
      <p className="hidden text-xs font-semibold leading-4 tracking-[0.6px] text-[#777587] sm:block">
        {desktopSubtitle}
      </p>
    </div>
  );
}
