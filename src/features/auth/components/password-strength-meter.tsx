import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  strength?: 0 | 1 | 2 | 3 | 4;
  className?: string;
}

export function PasswordStrengthMeter({ strength = 0, className }: PasswordStrengthMeterProps) {
  const labels: Record<number, string> = {
    0: "NONE",
    1: "WEAK",
    2: "FAIR",
    3: "GOOD",
    4: "STRONG",
  };

  const segmentColors: Record<number, string> = {
    0: "bg-[#c7c4d8]",
    1: "bg-[#ba1a1a]",
    2: "bg-[#f59e0b]",
    3: "bg-[#3525cd]",
    4: "bg-[#006c49]",
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-[6px] flex-1 rounded-full transition-colors duration-300",
              index < strength ? segmentColors[strength] : "bg-[#c7c4d8]"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs leading-4 text-[#777587]">Password strength</span>
        <span className="text-xs font-semibold leading-4 text-[#464555]">{labels[strength]}</span>
      </div>
    </div>
  );
}
