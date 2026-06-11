import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "@/styles/globals.css";
import { getDirection, isLocale, locales } from "@/lib/i18n";
import { Providers } from "../providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export function generateStaticParams() {

    return locales.map((locale) => ({ locale }));

}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {

    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "app" });

    return {
        title: t("title"),
        description: t("description"),
    };

}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {

    const { locale } = await params;

    if ( !isLocale(locale) ) notFound();

    setRequestLocale(locale);

    return (

        <html
            lang={locale}
            dir={getDirection(locale)}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >

            <body className="min-h-full flex flex-col">

                <NextIntlClientProvider>

                    <Providers>{children}</Providers>

                </NextIntlClientProvider>

            </body>

        </html>

    );

}
