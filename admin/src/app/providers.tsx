"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
            }),
    );

    return (

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>

            <QueryClientProvider client={queryClient}>

                {children}
                <Toaster richColors position="top-right" />
                <ReactQueryDevtools initialIsOpen={false} />

            </QueryClientProvider>

        </ThemeProvider>

    );

}
