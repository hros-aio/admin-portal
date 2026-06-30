import { cn } from "@/lib/utils";

interface AtmosphericBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "sso";
}

export function AtmosphericBackground({
  children,
  className,
  variant = "default",
}: AtmosphericBackgroundProps) {
  return (
    <div
      className={cn("relative flex min-h-screen flex-col overflow-hidden bg-[#f9f9ff]", className)}
    >
      {/* Indigo radial overlay */}
      <div
        className="pointer-events-none absolute -left-[20%] -top-[10%] h-[60%] w-[60%] rounded-full blur-[60px]"
        style={{
          backgroundColor: variant === "sso" ? "rgba(30, 0, 169, 0.10)" : "rgba(30, 0, 169, 0.05)",
        }}
        aria-hidden="true"
      />

      {/* Green radial overlay */}
      <div
        className="pointer-events-none absolute bottom-[5%] right-[5%] h-[50%] w-[50%] rounded-full blur-[50px]"
        style={{ backgroundColor: "rgba(0, 108, 73, 0.05)" }}
        aria-hidden="true"
      />

      {/* Decorative pill */}
      <div
        className="pointer-events-none absolute left-[10%] top-[40%] h-[30%] w-[25%] rounded-[9999px] blur-[40px]"
        style={{ backgroundColor: "rgba(30, 0, 169, 0.05)" }}
        aria-hidden="true"
      />

      {children}
    </div>
  );
}
