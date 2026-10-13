import type { ReactNode } from "react";
import Heading from "@/elements/heading";
import Section from "@/elements/section";

type Props = { id: string; title: string; primary: boolean; children: ReactNode };

export default function Titled ({ id, title, primary, children }: Props) {
    const heading = `${id}-heading`;

    return (

        <Section name={id} labeledBy={heading}>

            <Heading level={primary ? 1 : 2} text={title} id={heading} />

            {children}

        </Section>

    );
}
