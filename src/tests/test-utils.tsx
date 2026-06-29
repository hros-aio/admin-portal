import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import { useState } from "react";

import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AppTestProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeTestQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export function render(ui: React.ReactElement, options: Omit<RenderOptions, "wrapper"> = {}) {
  return rtlRender(ui, { wrapper: AppTestProviders, ...options });
}

export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
