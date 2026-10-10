"use client";

import type { ReactNode } from "react";
import { Tabs as Base } from "@/lib/providers/ui";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Tab = { value: string; label: string; panel?: ReactNode; disabled?: boolean; icon?: ReactNode; count?: number };
type Props = VariantProps<typeof tabs> & {
    label: string;
    value: string;
    tabs: readonly Tab[];
    onValueChange: ( value: string ) => void;
};

const tabs = tv({
    slots: {
        list: "",
        tab: "",
        thumb: "",
        panel: "pt-5 outline-none",
    },
    variants: {
        look: {
            pill: { list: "tabs-track", tab: "tab", thumb: "tab-thumb" },
            line: { list: "tabs-line", tab: "tab-line", thumb: "tab-line-thumb" },
        },
        width: { auto: {}, full: { list: "flex w-full", tab: "flex-1" } },
    },
    defaultVariants: { look: "pill", width: "auto" },
});

export default function Tabs ({ label, value, tabs: entries, onValueChange, look, width }: Props) {

    const styles = tabs({ look, width });

    return (

        <Base.Root value={value} onValueChange={( next ) => onValueChange(String(next))}>

            <Base.List aria-label={label} className={styles.list()}>

                {entries.map(( entry ) => (

                    <Base.Tab key={entry.value} value={entry.value} disabled={entry.disabled} className={styles.tab()}>

                        {entry.icon}

                        {entry.label}

                        {entry.count ? <span className="tab-count">{entry.count}</span> : null}

                    </Base.Tab>

                ))}

                <Base.Indicator renderBeforeHydration className={styles.thumb()} />

            </Base.List>

            {entries.map(( entry ) => entry.panel ? (

                <Base.Panel key={entry.value} value={entry.value} className={styles.panel()}>{entry.panel}</Base.Panel>

            ) : null)}

        </Base.Root>

    );

}
