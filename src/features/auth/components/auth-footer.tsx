import { cn } from "@/lib/utils";

interface AuthFooterProps {
  className?: string;
  securityLogId?: string;
}

export function AuthFooter({ className, securityLogId }: AuthFooterProps) {
  const footerLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
    { label: "Contact Support", href: "#" },
  ];

  return (
    <footer
      className={cn(
        "mt-auto flex w-full flex-col items-center gap-3 border-t border-[rgba(199,196,216,0.3)] px-4 py-5 text-center sm:flex-row sm:justify-between sm:px-6 sm:py-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
            }}
            className="text-xs leading-4 text-[#777587] transition-colors hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 sm:items-end">
        <p className="text-xs leading-4 text-[#777587]">
          © {new Date().getFullYear()} HROS Admin. All rights reserved.
        </p>
        {securityLogId && (
          <p className="text-[11px] leading-4 text-[#777587]">Security log ID: {securityLogId}</p>
        )}
      </div>
    </footer>
  );
}
