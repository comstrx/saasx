import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof record> & {
    media?: ReactNode;
    children: ReactNode;
    details?: ReactNode;
    action?: ReactNode;
    busy?: boolean;
};

const record = tv({
    slots: {
        frame: "relative min-w-0 rounded-3xl border border-edge bg-panel shadow-sm control-motion",
        main: "flex min-w-0 items-start gap-4 sm:gap-5",
        media: "w-20 shrink-0 sm:w-28",
        body: "flex min-w-0 flex-1 flex-col gap-1.5",
        side: "flex min-w-0 flex-col gap-3",
    },
    variants: {
        compact: {
            true: {
                frame: "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5",
                main: "flex-1",
                side: "sm:shrink-0 sm:items-end",
            },
            false: {
                frame: "grid gap-5 p-4 sm:p-6 md:grid-cols-3",
                main: "md:col-span-2",
                side: "border-t border-line pt-4 md:border-s md:border-t-0 md:ps-6 md:pt-0",
            },
        },
        interactive: { true: { frame: "hover:shadow-md has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-focus" } },
    },
    defaultVariants: { compact: false },
});

export default function Record ({ media, children, details, action, busy, compact, interactive }: Props) {

    const styles = record({ compact, interactive });

    return (

        <li className={styles.frame()} aria-busy={busy || undefined}>

            <div className={styles.main()}>

                {media ? <div className={styles.media()}>{media}</div> : null}

                <div className={styles.body()}>{children}</div>

            </div>

            {details || action ? (

                <div className={styles.side()}>

                    {details ? <div className="min-w-0">{details}</div> : null}

                    {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}

                </div>

            ) : null}

        </li>

    );

}
