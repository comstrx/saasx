import type { ReactNode } from "react";
import Heading from "@/elements/heading";
import Section from "@/elements/section";

type Props = { id: string; title: string; primary: boolean; children: ReactNode };

export default function Titled ({ id, title, primary, children }: Props) {
    return (

        <Section name={id}>

            <Heading level={primary ? 1 : 2} text={title} />

            {children}

        </Section>

    );
}
