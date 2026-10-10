"use client";

import type { ReactNode } from "react";
import { CaretDown } from "@/lib/providers/icons";
import { Accordion as Base } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Item = { key: string; title: ReactNode; meta?: ReactNode; body: ReactNode; open?: boolean; icon?: ReactNode };
type Props = VariantProps<typeof accordion> & { items: readonly Item[]; multiple?: boolean };

const accordion = tv({
    slots: {
        root: "flex min-w-0 flex-col",
        item: "",
        trigger: [
            "group flex w-full min-h-14 cursor-pointer items-center gap-3 py-4 text-start text-base font-medium text-ink",
            "control-motion hover:text-accent",
        ],
        caret: "size-4 shrink-0 text-muted control-motion group-data-panel-open:rotate-180",
        panel: "accordion-panel",
    },
    variants: {
        look: {
            lines: { root: "divide-y divide-line", item: "" },
            cards: { root: "gap-3", item: "rounded-2xl border border-edge bg-panel px-5 shadow-sm" },
            panel: {
                root: "divide-y divide-line overflow-hidden rounded-3xl border border-edge bg-panel shadow-sm",
                item: "px-5 sm:px-6",
            },
        },
    },
    defaultVariants: { look: "lines" },
});

export default function Accordion ({ items, multiple = true, look }: Props) {

    const styles = accordion({ look });
    const opened = items.filter(( item ) => item.open).map(( item ) => item.key);

    return (

        <Base.Root multiple={multiple} defaultValue={opened} className={styles.root()}>

            {items.map(( item ) => (

                <Base.Item key={item.key} value={item.key} className={styles.item()}>

                    <Base.Header>

                        <Base.Trigger className={styles.trigger()}>

                            {item.icon ? <span className="shrink-0 text-muted">{item.icon}</span> : null}

                            <span className="min-w-0 flex-1">{item.title}</span>

                            {item.meta ? <span className="shrink-0 text-small text-muted">{item.meta}</span> : null}

                            <CaretDown weight="bold" className={styles.caret()} />

                        </Base.Trigger>

                    </Base.Header>

                    <Base.Panel className={styles.panel()}>

                        <div className="pb-5 text-small text-muted">{item.body}</div>

                    </Base.Panel>

                </Base.Item>

            ))}

        </Base.Root>

    );

}
