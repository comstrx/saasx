import type { ReactNode } from "react";
import Container from "@/elements/container";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import AccessPanel from "./access-panel";

type Props = { title: string; description?: string; art?: string; children: ReactNode; footer?: ReactNode };

export default function FormPanel ({ title, description, art, children, footer }: Props) {

    if ( art ) return <AccessPanel title={title} description={description} art={art} footer={footer}>{children}</AccessPanel>;

    return (

        <Container width="form">

            <Surface padding={8} radius="xl" motion="enter">

                <Stack gap={6}>

                    <Stack gap={2}>

                        <Heading level={1} size="h2">{title}</Heading>

                        {description ? <Text tone="muted" wrap="pretty">{description}</Text> : null}

                    </Stack>

                    {children}

                    {footer}

                </Stack>

            </Surface>

        </Container>

    );

}
