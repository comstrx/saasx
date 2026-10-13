import type { ReactNode } from "react";

type Props = { locale: string; direction: "ltr" | "rtl"; theme: string; trace?: string | undefined; children: ReactNode };

export default function Document ({ locale, direction, theme, trace, children }: Props) {
    return (

        <html lang={locale} dir={direction} data-theme={theme === "system" ? undefined : theme} data-trace={trace} suppressHydrationWarning>

            <body>{children}</body>

        </html>

    );
}
