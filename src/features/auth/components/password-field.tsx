"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { AuthInput, type AuthInputProps } from "./auth-input";
import { EyeIcon, EyeOffIcon, LockIcon } from "./icons";

interface PasswordFieldProps extends Omit<AuthInputProps, "type" | "rightElement"> {
  showToggle?: boolean;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ showToggle = true, className, label = "Password", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <AuthInput
        ref={ref}
        type={showPassword ? "text" : "password"}
        label={label}
        leftIcon={<LockIcon className="h-5 w-5" />}
        className={cn("", className)}
        rightElement={
          showToggle ? (
            <button
              type="button"
              onClick={() => {
                setShowPassword((prev) => !prev);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#777587] transition-colors hover:bg-[#f0f3ff] hover:text-[#1e00a9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e00a9] focus-visible:ring-offset-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);
PasswordField.displayName = "PasswordField";
