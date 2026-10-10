import type { ReactNode } from "react";
import Columns from "@/elements/columns";
import Stack from "@/elements/stack";
import Section from "./section";

type Props = { id?: string; title: string; summary: ReactNode; children: ReactNode };

export default function ReviewSection ({ id, title, summary, children }: Props) {

    return (

        <Section id={id} title={title}>

            <Columns ratio="1:2" gap={8} start={summary} end={<Stack gap={6}>{children}</Stack>} />

        </Section>

    );

}
