"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useLocale } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { configure, isApiError } from "@/api";
import { Toaster } from "@/components/ui/elements/sonner";
import type { Direction } from "@/lib/utils/i18n";

function report ( error: unknown ) {

    if ( isApiError(error) && error.isValidation ) return;

    toast.error(isApiError(error) ? error.message : "Something went wrong");

}
function createClient () {

    return new QueryClient({
        queryCache: new QueryCache({ onError: report }),
        defaultOptions: {
            queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false },
            mutations: { retry: false, onError: report },
        },
    });

}
export function Providers ({ children, dir }: { children: React.ReactNode; dir: Direction }) {

    const locale = useLocale();
    const [queryClient] = useState(createClient);

    configure({ context: () => ({ locale }) });

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
