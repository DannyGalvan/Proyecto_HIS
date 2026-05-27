import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { createElement } from "react";
import { MemoryRouter } from "react-router";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  /** Initial route entries for MemoryRouter. Defaults to ["/"] */
  initialEntries?: string[];
  /** Custom QueryClient instance. A fresh one is created per render if not provided. */
  queryClient?: QueryClient;
}

/**
 * Creates a fresh QueryClient configured for testing:
 * - No retries (fail fast)
 * - No garbage collection time (immediate cleanup)
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Custom render function that wraps components with the necessary providers
 * for testing: QueryClientProvider and MemoryRouter.
 *
 * Usage:
 * ```ts
 * import { customRender } from "@/test-utils/render";
 *
 * const { getByText } = customRender(<MyComponent />);
 * ```
 */
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  const {
    initialEntries = ["/"],
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  function Wrapper({ children }: { readonly children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries },
      createElement(QueryClientProvider, { client: queryClient }, children),
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

export { createTestQueryClient };
