import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Step = { key: string; title: string; body?: ReactNode };
type Props = VariantProps<typeof steps> & { items: readonly Step[]; label: string };

const steps = tv({
    slots: {
        list: "steps-list",
        item: "steps-item",
    },
    variants: {
        direction: { column: {}, row: { list: "steps-row" } },
    },
    defaultVariants: { direction: "column" },
});

export default function Steps ({ items, label, direction }: Props) {

    const styles = steps({ direction });

    return (

        <ol aria-label={label} className={styles.list()}>

            {items.map(( step, index ) => (

                <li key={step.key} className={styles.item()}>

                    <span aria-hidden="true" className="steps-number ceramic-teal">{index + 1}</span>

                    <span className="flex min-w-0 flex-col gap-1 pt-1">

                        <span className="text-base font-semibold text-ink">{step.title}</span>

                        {step.body ? <span className="text-small text-muted">{step.body}</span> : null}

                    </span>

                </li>

            ))}

        </ol>

    );

}
