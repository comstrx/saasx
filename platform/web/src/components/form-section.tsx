import type { ReactNode } from "react";
import Columns from "@/elements/columns";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";

type Props = { title?: string; description?: string; layout?: "stacked" | "split"; children: ReactNode };

export default function FormSection ({ title, description, layout = "stacked", children }: Props) {

    const head = title || description ? (

        <Stack gap={2}>

            {title ? <Heading size={layout === "split" ? "title" : "h3"}>{title}</Heading> : null}

            {description ? <Text size="small" tone="muted" wrap="pretty">{description}</Text> : null}

        </Stack>

    ) : null;

    if ( layout === "split" ) return (

        <Surface padding={8} radius="xl">

            <Columns ratio="1:2" gap={8} start={head} end={<Stack gap={5}>{children}</Stack>} />

        </Surface>

    );

    return (

        <Surface>

            <Stack gap={5}>

                {head}

                {children}

            </Stack>

        </Surface>

    );

}
