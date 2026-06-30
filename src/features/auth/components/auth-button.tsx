import { cn } from "@/lib/utils";
import * as React from "react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "default" | "large" | "compact";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      fullWidth = true,
      leftIcon,
      rightIcon,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

    const variantClasses = {
      primary:
        "bg-[#1e00a9] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#3525cd]",
      secondary: "bg-[#f0f3ff] text-[#151c27] hover:bg-[#e2dfff]",
      outline:
        "border border-[#c7c4d8] bg-white text-[#151c27] hover:bg-[#f0f3ff] hover:text-[#1e00a9]",
      text: "text-[#1e00a9] hover:text-[#3525cd] hover:underline hover:underline-offset-4 focus-visible:underline",
    };

    const sizeClasses = {
      default: "h-12 px-5 text-base",
      large: "h-14 px-6 text-xl font-semibold leading-7",
      compact: "h-9 px-4 text-xs font-semibold uppercase tracking-wide",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled ? true : isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);
AuthButton.displayName = "AuthButton";
