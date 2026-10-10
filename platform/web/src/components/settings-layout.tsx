import type { ReactNode } from "react";
import Stack from "@/elements/stack";
import PageHead from "./page-head";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = { title: string; description: string; icon?: string | null; tone?: Tone; actions?: ReactNode; children: ReactNode };

export default function SettingsLayout ({ title, description, icon, tone, actions, children }: Props) {

    return (

        <Stack gap={8}>

            <PageHead title={title} description={description} icon={icon} tone={tone} actions={actions} />

            {children}

        </Stack>

    );

}
