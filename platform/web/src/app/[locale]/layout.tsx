import "@/styles/base.css";
import "@spec/theme.css";

import { choose } from "engine/base";
import type { ReactNode } from "react";
import Document from "@/elements/document";
import { siteMetadata } from "@/lib/seo/index";
import { requestTheme, requestTrace } from "@/lib/site/request";
import { delivery, routing } from "@/lib/spec/config";
import { type Locale, languages } from "@/lib/spec/languages";
import { config } from "@/lib/spec/server";
import { Providers } from "../providers.tsx";

type Props = { params: Promise<{ locale: string }>; children: ReactNode };

export const generateMetadata = siteMetadata;

async function visit (): Promise<{ trace: string | undefined; theme: string }> {

    if ( delivery === "static" ) return { trace: undefined, theme: config.settings.theme.default };

    const [trace, theme] = await Promise.all([requestTrace(), requestTheme()]);

    return { trace, theme };

}
export default async function RootLayout ({ params, children }: Props) {

    const locale = choose(routing.locales, (await params).locale, routing.defaultLocale) as Locale;
    const { trace, theme } = await visit();

    return (

        <Document locale={locale} direction={languages[locale].direction} theme={theme} trace={trace}>

            <Providers>{children}</Providers>

        </Document>

    );

}
