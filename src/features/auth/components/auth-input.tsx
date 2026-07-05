import { cn } from "@/lib/utils";
import * as React from "react";

export interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  labelAction?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  inputSize?: "default" | "large";
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      className,
      label,
      labelAction,
      leftIcon,
      rightElement,
      error,
      inputSize = "default",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hasLabelRow = [label, labelAction].some((item) => item != null);

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {hasLabelRow && (
          <div className="flex items-center justify-between gap-3 px-1">
            {label ? (
              <label
                htmlFor={inputId}
                className="text-xs font-semibold uppercase leading-4 tracking-[1.2px] text-[#151c27] sm:normal-case sm:tracking-[0.6px]"
              >
                {label}
              </label>
            ) : (
              <span />
            )}
            {labelAction}
          </div>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777587]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-lg border bg-white text-[#151c27] placeholder:text-[#6b7280] focus-visible:border-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9]/20 disabled:cursor-not-allowed disabled:bg-[#f0f3ff]",
              inputSize === "default" && "h-12 px-4 text-base sm:text-sm",
              inputSize === "large" && "h-[57px] px-4 text-base",
              leftIcon && "pl-[45px]",
              rightElement && "pr-12",
              error
                ? "border-[#ba1a1a] focus-visible:border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20"
                : "border-[#c7c4d8]",
              props.type === "password" && "font-medium tracking-widest"
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs leading-4 text-[#93000a]">
            {error}
          </p>
        )}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
