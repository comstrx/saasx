import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Row = { key: string; term: string; detail: ReactNode; icon?: ReactNode };
type Props = VariantProps<typeof list> & { items: readonly Row[] };

const list = tv({
    slots: {
        frame: "spec-list",
        row: "spec-row",
        term: "flex min-w-0 items-center gap-2.5 text-small font-medium text-ink",
        detail: "min-w-0 text-small text-muted",
    },
    variants: {
        look: { panel: { frame: "spec-panel" }, plain: {} },
        columns: { split: { row: "spec-split" }, stacked: { row: "grid-cols-1" } },
    },
    defaultVariants: { look: "panel", columns: "split" },
});

export default function SpecList ({ items, look, columns }: Props) {

    const styles = list({ look, columns });

    return (

        <dl className={styles.frame()}>

            {items.map(( item ) => (

                <div key={item.key} className={styles.row()}>

                    <dt className={styles.term()}>

                        {item.icon ? <span aria-hidden="true" className="spec-icon">{item.icon}</span> : null}

                        {item.term}

                    </dt>

                    <dd className={styles.detail()} dir="auto">{item.detail}</dd>

                </div>

            ))}

        </dl>

    );

}
