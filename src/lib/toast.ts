"use client";

import { createContext, useContext } from "react";

export interface ToastContextValue {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export const toast = {
  success: (title: string, description?: string) => {
    console.warn("toast.success called outside a React component. Use useToast hook instead.", {
      title,
      description,
    });
  },
  error: (title: string, description?: string) => {
    console.warn("toast.error called outside a React component. Use useToast hook instead.", {
      title,
      description,
    });
  },
};
