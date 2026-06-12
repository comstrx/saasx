"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/elements/sonner";
import type { Direction } from "@/lib/utils/i18n";

export function Providers ({ children, dir }: { children: React.ReactNode; dir: Direction }) {

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
                    mutations: { retry: 0 },
                },
            }),
    );

    return (

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>

            <QueryClientProvider client={queryClient}>

                {children}

                <Toaster richColors dir={dir} position={dir === "rtl" ? "top-left" : "top-right"} />
                <ReactQueryDevtools initialIsOpen={false} />

            </QueryClientProvider>

        </ThemeProvider>

    );

}
