import type { ReactNode } from "react";
import Badge from "@/elements/badge";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Voucher from "@/elements/voucher";
import Icon from "@/icons/icon";

type Props = {
    value: string; caption: string; name: string; code?: string | null; description?: string | null; terms: readonly string[];
    expires?: string | null; status?: { label: string; tone: "teal" | "ember" | "neutral" } | null; action?: ReactNode;
    tone?: "teal" | "ember"; inactive?: boolean; level?: 1 | 2 | 3;
};

export default function CouponCard ({
    value, caption, name, code, description, terms, expires, status, action, tone, inactive, level = 3,
}: Props) {

    return (

        <Voucher
            tone={tone}
            inactive={inactive}
            stub={(

                <Stack gap={1} align="center">

                    <Text as="span" size="title" tone="inherit" weight="bold" align="center" numeric dir="ltr">{value}</Text>

                    <Text as="span" size="label" tone="inherit" weight="semibold" align="center">{caption}</Text>

                </Stack>

            )}
        >

            <Stack direction="row" align="start" justify="between" gap={3}>

                <Stack gap={1}>

                    <Heading level={level} size={level === 1 ? "h2" : "title"} clamp={2}>{name}</Heading>

                    {description ? <Text size="small" tone="muted" clamp={2}>{description}</Text> : null}

                </Stack>

                {status ? <Badge tone={status.tone}>{status.label}</Badge> : null}

            </Stack>

            {terms.length ? (

                <Stack direction="row" gap={3} wrap>

                    {terms.map(( term ) => (

                        <Stack key={term} direction="row" gap={1} align="center">

                            <Icon name="check" size="sm" tone="accent" />

                            <Text as="span" size="label" tone="muted">{term}</Text>

                        </Stack>

                    ))}

                </Stack>

            ) : null}

            {code || expires || action ? (

                <Stack direction="row" align="center" justify="between" gap={3} wrap>

                    <Stack direction="row" align="center" gap={3} wrap>

                        {code ? <Badge tone="ivory"><Icon name="tag" size="sm" />{`⁦${code}⁩`}</Badge> : null}

                        {expires ? <Text as="span" size="label" tone="muted">{expires}</Text> : null}

                    </Stack>

                    {action}

                </Stack>

            ) : null}

        </Voucher>

    );

}
