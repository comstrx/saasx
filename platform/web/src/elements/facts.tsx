import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Props = VariantProps<typeof facts> & { items: readonly { key: string; term: string; detail?: ReactNode; icon?: ReactNode }[] };

const facts = tv({
    slots: {
        list: "grid min-w-0",
        item: "flex min-w-0 items-start gap-3",
        icon: "grid size-10 shrink-0 place-items-center rounded-icon border border-line bg-track text-ink [&>svg]:size-5",
        term: "text-small font-medium text-ink",
        detail: "mt-0.5 text-small text-muted",
    },
    variants: {
        columns: {
            1: { list: "grid-cols-1 gap-4" },
            2: { list: "grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2" },
            3: { list: "grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-3" },
        },
        compact: { true: { list: "grid-cols-2 gap-x-4 gap-y-4", icon: "size-8 rounded-icon [&>svg]:size-4" } },
        raised: { true: { icon: "border-edge bg-panel text-accent shadow-sm", term: "text-base font-semibold" } },
    },
    defaultVariants: { columns: 2 },
});

export default function Facts ({ items, columns, compact, raised }: Props) {

    const styles = facts({ columns, compact, raised });

    return (

        <dl className={styles.list()}>

            {items.map(( item ) => (

                <div key={item.key} className={styles.item()}>

                    {item.icon ? <span aria-hidden="true" className={styles.icon()}>{item.icon}</span> : null}

                    <div className="min-w-0 pt-0.5">

                        <dt className={styles.term()}>{item.term}</dt>

                        {item.detail ? <dd className={styles.detail()}>{item.detail}</dd> : null}

                    </div>

                </div>

            ))}

        </dl>

    );

}
