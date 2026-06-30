import { cn } from "@/lib/utils";
import { AlertCircleIcon, XIcon } from "./icons";

interface ErrorBannerProps {
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ title, message, className, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-[rgba(186,26,26,0.2)] bg-[#ffdad6] p-4",
        className
      )}
      role="alert"
    >
      <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ba1a1a]" />
      <div className="flex-1">
        {title && <p className="text-sm font-semibold leading-5 text-[#93000a]">{title}</p>}
        <p className="text-sm leading-5 text-[#93000a]">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#93000a] transition-colors hover:bg-[rgba(186,26,26,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ba1a1a] focus-visible:ring-offset-2"
          aria-label="Dismiss error"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
