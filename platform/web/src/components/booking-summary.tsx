import type { ReactNode } from "react";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Thumb from "@/elements/thumb";

type Props = { name: string; image?: string | null; detail?: string; href?: string | null; children?: ReactNode };

export default function BookingSummary ({ name, image, detail, href, children }: Props) {

    return (

        <Surface elevation="medium" padding={5}>

            <Stack gap={5}>

                <Stack direction="row" gap={4} align="center">

                    {image ? <Thumb src={image} alt="" size="large" fit="cover" /> : null}

                    <Stack gap={1}>

                        <Heading size="title" clamp={2}>{href ? <Link href={href} variant="heading">{name}</Link> : name}</Heading>

                        {detail ? <Text size="small" tone="muted">{detail}</Text> : null}

                    </Stack>

                </Stack>

                {children ? <Divider /> : null}

                {children}

            </Stack>

        </Surface>

    );

}
