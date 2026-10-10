import type { ReactNode } from "react";
import Button from "@/elements/button";
import Heading from "@/elements/heading";
import Media from "@/elements/media";
import Record from "@/elements/record";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Text from "@/elements/text";

type Props = {
    name: string; reference: string; image?: string | null;
    status: { label: string; tone: "neutral" | "positive" | "attention" | "negative" };
    description?: string; children?: ReactNode; disabled?: boolean;
    action?: { label: string; onClick: () => void };
    secondary?: { label: string; onClick: () => void };
};

export default function PurchaseItem ({ name, reference, image, status, description, children, disabled, action, secondary }: Props) {

    return (

        <Record
            media={image ? <Media src={image} alt="" ratio="square" /> : undefined}
            details={children}
            action={<>

                {action ? <Button variant="outlined" disabled={disabled} onClick={action.onClick}>{action.label}</Button> : null}
                {secondary ? <Button variant="ghost" disabled={disabled} onClick={secondary.onClick}>{secondary.label}</Button> : null}

            </>}
        >

            <Stack direction="row" align="center" justify="between" gap={2} wrap>

                <Text size="small" tone="muted">{reference}</Text>
                <Status tone={status.tone}>{status.label}</Status>

            </Stack>

            <Heading level={2} size="title">{name}</Heading>
            {description ? <Text size="small" tone="muted">{description}</Text> : null}

        </Record>

    );

}
