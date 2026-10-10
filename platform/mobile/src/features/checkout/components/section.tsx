import type { ReactNode } from "react";
import { Panel } from "@/components/panel";

type CheckoutSectionProps = {
    title?: string | undefined;
    body?: string | undefined;
    children: ReactNode;
};

export function CheckoutSection ({ title, body, children }: CheckoutSectionProps) {

    return <Panel title={title} note={body}>{children}</Panel>;

}
