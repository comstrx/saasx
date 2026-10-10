import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";
import Check from "./check";

type Props = Omit<VariantProps<typeof row>, "indented"> & {
    title: ReactNode;
    description?: ReactNode;
    media?: ReactNode;
    meta?: ReactNode;
    action?: ReactNode;
    as?: "li" | "div";
    busy?: boolean;
    select?: { id: string; label: string; checked: boolean; disabled?: boolean; onChange: ( checked: boolean ) => void } | null;
};

const row = tv({
    slots: {
        frame: [
            "flex min-w-0 flex-col gap-3 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0",
            "sm:flex-row sm:items-center sm:gap-6",
        ],
        main: "flex min-w-0 flex-1 items-start gap-4",
        body: "flex min-w-0 flex-1 flex-col gap-1",
        head: "flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1",
        title: "text-value font-semibold text-ink",
        description: "text-small text-pretty text-muted",
        action: "flex shrink-0 flex-wrap items-center gap-2",
    },
    variants: {
        tone: { neutral: {}, danger: { title: "text-danger" } },
        indented: { true: { action: "ps-[calc(var(--control-md)+1rem)] sm:ps-0" } },
    },
    defaultVariants: { tone: "neutral" },
});

export default function SettingRow ({ title, description, media, meta, action, as: Tag = "li", busy, tone, select }: Props) {

    const styles = row({ tone, indented: Boolean(media) });

    return (

        <Tag className={styles.frame()} aria-busy={busy || undefined}>

            <div className={styles.main()}>

                {select ? (

                    <Check
                        id={select.id} label={select.label} labelVisible={false} checked={select.checked} disabled={select.disabled}
                        onChange={select.onChange}
                    />

                ) : null}

                {media}

                <div className={styles.body()}>

                    <div className={styles.head()}>

                        <span className={styles.title()}>{title}</span>

                        {meta}

                    </div>

                    {description ? <div className={styles.description()}>{description}</div> : null}

                </div>

            </div>

            {action ? <div className={styles.action()}>{action}</div> : null}

        </Tag>

    );

}
