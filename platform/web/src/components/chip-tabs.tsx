import type { ReactNode } from "react";
import Link from "@/elements/link";
import Stack from "@/elements/stack";

type Props = { label: string; current: string; tabs: readonly { value: string; label: string; href: string; meta?: ReactNode }[] };

export default function ChipTabs ({ label, current, tabs }: Props) {

    return (

        <Stack direction="row" gap={2} wrap role="group" aria-label={label}>

            {tabs.map(( tab ) => (

                <Link key={tab.value} href={tab.href} variant="chip" active={tab.value === current} replace scroll={false}>

                    {tab.label}

                    {tab.meta}

                </Link>

            ))}

        </Stack>

    );

}
