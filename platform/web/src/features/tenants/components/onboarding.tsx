"use client";

import WorkspaceOnboarding from "@/components/workspace-onboarding";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string; description: string; icon?: string | null; tone?: Tone;
    links: { workspaces: string; plans: string; login: string; empty: string };
};

export default function Onboarding ( props: Props ) {

    return <WorkspaceOnboarding {...props} />;

}
