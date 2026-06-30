import { cn } from "@/lib/utils";
import { CheckIcon } from "./icons";

interface ValidationChecklistProps {
  items: { label: string; valid: boolean }[];
  className?: string;
}

export function ValidationChecklist({ items, className }: ValidationChecklistProps) {
  return (
    <div className={cn("rounded-lg bg-[#f0f3ff] p-[17px]", className)}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                item.valid ? "bg-[#006c49] text-white" : "bg-[#c7c4d8] text-white"
              )}
            >
              <CheckIcon className="h-3 w-3" />
            </div>
            <span
              className={cn(
                "text-sm leading-5 transition-colors",
                item.valid ? "text-[#006c49]" : "text-[#464555]"
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
