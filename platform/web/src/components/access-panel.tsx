import type { ReactNode } from "react";
import Art from "@/elements/art";
import Container from "@/elements/container";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";

type Props = { title: string; description?: string; art?: string; level?: 1 | 2; children: ReactNode; footer?: ReactNode };

export default function AccessPanel ({ title, description, art, level = 1, children, footer }: Props) {

    return (

        <Container width="access">

            <Surface padding={10} radius="hero" elevation="medium" motion="enter">

                <Stack gap={8}>

                    <Stack gap={3} align="center">

                        {art ? <Art src={art} size="large" motion="float" priority /> : null}

                        <Heading level={level} size="h2" align="center" wrap="balance">{title}</Heading>

                        {description ? <Text tone="muted" align="center" measure="short" wrap="pretty">{description}</Text> : null}

                    </Stack>

                    {children}

                    {footer}

                </Stack>

            </Surface>

        </Container>

    );

}
