import { cn } from "@/lib/utils";

interface AuthFooterProps {
  className?: string;
  securityLogId?: string;
  variant?: "default" | "figma";
  showBrand?: boolean;
}

export function AuthFooter({
  className,
  securityLogId,
  variant = "default",
  showBrand = false,
}: AuthFooterProps) {
  const isFigmaVariant = variant === "figma";
  const footerLinks = isFigmaVariant
    ? [
        { label: "Support", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
      ]
    : [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Security", href: "#" },
        { label: "Contact Support", href: "#" },
      ];

  return (
    <footer
      className={cn(
        "mt-auto flex w-full flex-col items-center gap-3 px-4 py-5 text-center",
        isFigmaVariant
          ? "justify-center border-t-0 text-[#464555] sm:flex-row sm:gap-6 sm:px-6 sm:py-8"
          : "border-t border-[rgba(199,196,216,0.3)] sm:flex-row sm:justify-between sm:px-6 sm:py-6",
        className
      )}
    >
      {showBrand ? (
        <p className="text-xs font-bold leading-4 tracking-[0.6px] text-[#1e00a9]">HROS Admin</p>
      ) : null}

      {isFigmaVariant ? (
        <p className="text-sm leading-5 text-[#464555]">
          © 2024 HROS Admin. All sessions are encrypted.
        </p>
      ) : null}

      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-y-2",
          isFigmaVariant ? "gap-x-6" : "gap-x-4"
        )}
      >
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
            }}
            className={cn(
              "transition-colors hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2",
              isFigmaVariant
                ? "text-sm leading-5 text-[#464555]"
                : "text-xs leading-4 text-[#777587]"
            )}
          >
            {link.label}
          </a>
        ))}
      </div>

      {!isFigmaVariant ? (
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <p className="text-xs leading-4 text-[#777587]">
            © {new Date().getFullYear()} HROS Admin. All rights reserved.
          </p>
          {securityLogId && (
            <p className="text-[11px] leading-4 text-[#777587]">Security log ID: {securityLogId}</p>
          )}
        </div>
      ) : null}
    </footer>
  );
}
