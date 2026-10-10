import type { ReactNode } from "react";

type Props = { locale: string; direction: "ltr" | "rtl"; trace?: string; motion?: "system" | "reduced"; children: ReactNode };

export default function Document ({ locale, direction, trace, motion, children }: Props) {

    return (

        <html lang={locale} dir={direction} data-trace={trace} data-motion={motion} suppressHydrationWarning>

            <body>{children}</body>

        </html>

    );

}
