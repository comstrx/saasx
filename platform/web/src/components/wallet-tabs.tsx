import type { ReactNode } from "react";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import ChipTabs from "./chip-tabs";
import MoreButton from "./more-button";

type Props = {
    label: string; current: string; tabs: readonly { value: string; label: string; href: string }[];
    more: (() => void) | null; moreLabel: string; children: ReactNode;
};

export default function WalletTabs ({ label, current, tabs, more, moreLabel, children }: Props) {

    return (

        <Stack as="section" gap={5} aria-label={label}>

            <Stack direction="row" align="center" justify="between" gap={3} wrap>

                <Heading level={2} size="h3">{label}</Heading>

                <ChipTabs label={label} current={current} tabs={tabs} />

            </Stack>

            {children}

            <MoreButton label={moreLabel} onClick={more} />

        </Stack>

    );

}
