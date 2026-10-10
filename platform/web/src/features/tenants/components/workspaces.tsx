"use client";

import WorkspaceBoard from "@/components/workspace-board";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string; description: string; icon?: string | null; tone?: Tone;
    links: { login: string; create: string; plans: string; art: string; empty: string };
};

export default function Workspaces ( props: Props ) {

    return <WorkspaceBoard {...props} />;

}
