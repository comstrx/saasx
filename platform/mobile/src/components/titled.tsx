import type { ReactNode } from "react";
import Heading from "@/elements/heading";
import Section from "@/elements/section";

type Props = { id: string; title: string; primary: boolean; fill?: boolean | undefined; children: ReactNode };

export default function Titled ({ id, title, primary, fill, children }: Props) {

    return (

        <Section name={id} fill={fill}>

            <Heading level={primary ? 1 : 2} text={title} />

            {children}

        </Section>

    );

}
