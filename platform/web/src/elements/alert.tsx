import type { ReactNode } from "react";
import { CheckCircle, Info, Warning, WarningOctagon } from "@/lib/providers/icons";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof alert> & {
    id?: string;
    title?: ReactNode;
    children?: ReactNode;
    action?: ReactNode;
    live?: boolean;
    focusable?: boolean;
};

const alert = tv({
    slots: {
        frame: "flex min-w-0 items-start gap-3.5 rounded-2xl border bg-panel p-4 outline-none",
        pebble: "grid size-9 shrink-0 place-items-center rounded-icon",
        body: "flex min-w-0 flex-1 flex-col gap-1 pt-1",
    },
    variants: {
        tone: {
            info: { frame: "border-edge", pebble: "ceramic-info" },
            success: { frame: "border-edge", pebble: "ceramic-success" },
            warning: { frame: "border-edge", pebble: "ceramic-warning" },
            danger: { frame: "border-danger/40", pebble: "ceramic-danger" },
            neutral: { frame: "border-edge", pebble: "ceramic text-ink" },
        },
        size: { compact: { frame: "gap-3 rounded-xl p-3", pebble: "size-8 rounded-icon" }, normal: {} },
        hidden: { true: { frame: "sr-only" } },
    },
    defaultVariants: { tone: "info", size: "normal" },
});

const glyphs = { info: Info, success: CheckCircle, warning: Warning, danger: WarningOctagon, neutral: Info };

export default function Alert ({ id, tone, size, hidden, title, children, action, live, focusable }: Props) {

    const styles = alert({ tone, size, hidden });
    const Glyph = glyphs[tone ?? "info"];

    return (

        <div
            id={id}
            role={live ? (tone === "danger" ? "alert" : "status") : undefined}
            tabIndex={focusable ? -1 : undefined}
            className={styles.frame()}
        >

            <span aria-hidden="true" className={styles.pebble()}><Glyph weight="bold" className="size-4.5" /></span>

            <div className={styles.body()}>

                {title ? <p className="text-small font-semibold text-ink">{title}</p> : null}

                {children ? <div className={title ? "text-small text-muted" : "text-small text-ink"}>{children}</div> : null}

                {action ? <div className="mt-2 flex flex-wrap items-center gap-2">{action}</div> : null}

            </div>

        </div>

    );

}
