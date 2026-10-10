import type { ReactNode } from "react";
import Busy from "@/elements/busy";
import Stack from "@/elements/stack";
import PageHead from "./page-head";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string;
    description?: string;
    icon?: string | null;
    tone?: Tone;
    actions?: ReactNode;
    stats?: ReactNode;
    controls?: ReactNode;
    busy?: { active: boolean; label: string };
    children: ReactNode;
};

export default function CollectionView ({ title, description, icon, tone, actions, stats, controls, busy, children }: Props) {

    return (

        <Stack gap={6}>

            <PageHead title={title} description={description} icon={icon} tone={tone} actions={actions} />

            {stats}

            {controls}

            {busy ? <Busy busy={busy.active} label={busy.label} place="top"><Stack gap={6}>{children}</Stack></Busy> : children}

        </Stack>

    );

}
