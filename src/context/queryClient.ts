import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutos
      gcTime: 60 * 60 * 1000, // 60 minutos
      refetchOnWindowFocus: false,
    },
  },
})