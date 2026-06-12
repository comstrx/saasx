import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Readex_Pro } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { env } from "@/lib/env/client";
import { getDirection, isLocale, locales } from "@/lib/utils/i18n";
import { Providers } from "./providers";
import "@/styles/globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});
const readexPro = Readex_Pro({
    variable: "--font-readex",
    subsets: ["arabic"],
    display: "swap",
});

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams () {

    return locales.map((locale) => ({ locale }));

}
export async function generateMetadata ({ params }: Omit<Props, "children">): Promise<Metadata> {

    const { locale } = await params;

    if ( !isLocale(locale) ) notFound();

    const t = await getTranslations({ locale, namespace: "app" });

    return {
        metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
        title: { default: t("title"), template: `%s · ${t("title")}` },
        description: t("description"),
        applicationName: env.NEXT_PUBLIC_APP_NAME,
        alternates: {
            canonical: `/${locale}`,
            languages: {
                ...Object.fromEntries(locales.map((item) => [item, `/${item}`])),
                "x-default": "/",
            },
        },
        icons: {
            icon: "/favicon.ico",
            apple: "/assets/images/brand/apple-icon.png",
        },
        openGraph: {
            type: "website",
            siteName: env.NEXT_PUBLIC_APP_NAME,
            title: t("title"),
            description: t("description"),
            locale,
        },
        twitter: { card: "summary_large_image" },
    };

}
export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
};
export default async function Layout ({ children, params }: Props) {

    const { locale } = await params;

    if ( !isLocale(locale) ) notFound();

    setRequestLocale(locale);

    const dir = getDirection(locale);

    return (

        <html
            lang={locale}
            dir={dir}
            className={`${geistSans.variable} ${geistMono.variable} ${readexPro.variable} h-full antialiased`}
            suppressHydrationWarning
        >

            <body className="flex min-h-full flex-col bg-background font-sans text-foreground">

                <NextIntlClientProvider>

                    <Providers dir={dir}>{children}</Providers>

                </NextIntlClientProvider>

            </body>

        </html>

    );

}
