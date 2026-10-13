import "@/styles/base.css";
import "@spec/theme.css";

import type { ReactNode } from "react";
import Document from "@/elements/document";
import { siteMetadata } from "@/lib/seo/index";
import { requestLocale, requestTheme, requestTrace } from "@/lib/site/request";
import { type Locale, languages } from "@/lib/spec/languages";
import { Providers } from "../providers.tsx";

export const generateMetadata = siteMetadata;

export default async function RootLayout ({ children }: { children: ReactNode }) {

    const [locale, trace, theme] = await Promise.all([requestLocale(), requestTrace(), requestTheme()]);

    return (

        <Document locale={locale} direction={languages[locale as Locale].direction} theme={theme} trace={trace}>

            <Providers>{children}</Providers>

        </Document>

    );

}
