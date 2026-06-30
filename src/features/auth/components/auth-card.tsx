import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  softShadow?: boolean;
}

export function AuthCard({ children, className, softShadow = false }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-[#e5e7eb] bg-[rgba(255,255,255,0.95)] p-[25px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] backdrop-blur-[5px] sm:p-[33px]",
        softShadow &&
          "shadow-[0_10px_15px_-3px_rgba(30,0,169,0.1),0_4px_6px_-4px_rgba(30,0,169,0.1)]",
        className
      )}
    >
      {children}
    </div>
  );
}
