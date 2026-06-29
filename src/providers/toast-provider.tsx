"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: string;
  title: string;
  description: string | undefined;
  variant: ToastVariant;
}

interface ToastContextValue {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `${String(Date.now())}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: "success" });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: "error" });
    },
    [addToast]
  );

  const value = useMemo<ToastContextValue>(() => ({ success, error }), [success, error]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            duration={toast.variant === "error" ? 6_000 : 4_000}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            className="rounded-md border bg-card p-4 shadow-md data-[state=closed]:animate-none"
          >
            <Toast.Title
              className={
                toast.variant === "error"
                  ? "font-semibold text-destructive"
                  : toast.variant === "success"
                    ? "font-semibold text-success"
                    : "font-semibold"
              }
            >
              {toast.title}
            </Toast.Title>
            {toast.description ? (
              <Toast.Description className="mt-1 text-sm text-muted-foreground">
                {toast.description}
              </Toast.Description>
            ) : null}
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

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
