import type { ReactNode } from "react";

type Props = { name: string; labeledBy?: string | undefined; children: ReactNode };

export default function Section ({ name, labeledBy, children }: Props) {
    return <section className="section" data-name={name} aria-labelledby={labeledBy}>{children}</section>;
}
