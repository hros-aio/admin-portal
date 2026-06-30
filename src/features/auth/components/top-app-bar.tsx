import { cn } from "@/lib/utils";
import { HrosLogo, ShieldIcon, HelpCircleIcon } from "./icons";

interface TopAppBarProps {
  className?: string;
}

export function TopAppBar({ className }: TopAppBarProps) {
  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[rgba(199,196,216,0.3)] bg-[rgba(255,255,255,0.95)] px-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur-[6px]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <HrosLogo className="h-[26px] w-[26px]" />
        <span className="text-base font-semibold leading-6 tracking-tight text-[#151c27]">
          HROS Admin
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => undefined}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#464555] transition-colors hover:bg-[#f0f3ff] hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
          aria-label="Security status"
        >
          <ShieldIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => undefined}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#464555] transition-colors hover:bg-[#f0f3ff] hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
          aria-label="Help"
        >
          <HelpCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
