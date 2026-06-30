"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
}

export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  (
    { length = 6, value, onChange, disabled = false, autoFocus = true, className, inputClassName },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState((value ?? "").slice(0, length));
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(autoFocus ? 0 : null);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>(
      Array<HTMLInputElement | null>(length).fill(null)
    );

    const effectiveValue = (value ?? "").slice(0, length) || internalValue;

    const updateValue = (newValue: string) => {
      const normalized = newValue.replace(/\D/g, "").slice(0, length);
      setInternalValue(normalized);
      onChange?.(normalized);
    };

    const focusInput = (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
        setFocusedIndex(index);
      }
    };

    const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const char = event.target.value.slice(-1);
      if (!/^\d?$/.test(char)) return;

      const chars = effectiveValue.split("");
      chars[index] = char;
      const nextValue = chars.join("");
      updateValue(nextValue);

      if (char && index < length - 1) {
        focusInput(index + 1);
      }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && !effectiveValue[index]) {
        event.preventDefault();
        focusInput(index - 1);
        return;
      }

      if (event.key === "Backspace") {
        const chars = effectiveValue.split("");
        chars[index] = "";
        updateValue(chars.join(""));
        focusInput(index - 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusInput(index - 1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusInput(index + 1);
        return;
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      updateValue(pasted);
      focusInput(Math.min(pasted.length, length - 1));
    };

    const handleFocus = (index: number) => {
      setFocusedIndex(index);
      inputRefs.current[index]?.select();
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-2", className)}
        role="group"
        aria-label="Verification code"
      >
        {Array.from({ length }).map((_, index) => {
          const isSeparator = index === 2;
          return (
            <React.Fragment key={index}>
              {isSeparator && (
                <span className="mx-1 text-2xl font-semibold text-[#c7c4d8]" aria-hidden="true">
                  &middot;
                </span>
              )}
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                disabled={disabled}
                value={effectiveValue[index] ?? ""}
                onChange={(e) => {
                  handleChange(index, e);
                }}
                onKeyDown={(e) => {
                  handleKeyDown(index, e);
                }}
                onPaste={handlePaste}
                onFocus={() => {
                  handleFocus(index);
                }}
                onBlur={() => {
                  setFocusedIndex((prev) => (prev === index ? null : prev));
                }}
                aria-label={`Digit ${String(index + 1)} of ${String(length)}`}
                className={cn(
                  "h-14 w-12 rounded-lg border bg-white text-center text-lg font-semibold text-[#151c27] placeholder:text-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[#f0f3ff] sm:h-[56px] sm:w-12",
                  focusedIndex === index
                    ? "border-[#2563eb] ring-1 ring-[#2563eb]"
                    : "border-[#c7c4d8]",
                  inputClassName
                )}
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);
OtpInput.displayName = "OtpInput";
