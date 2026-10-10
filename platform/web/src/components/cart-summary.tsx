import Amount from "@/elements/amount";
import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import type { Money } from "@/lib/std/format";

type Props = {
    title: string; count: string; amount?: Money; currencyLabel: string; priceLabel: string; hint: string; unavailable: string;
    browse: { href: string; label: string };
};

export default function CartSummary ({ title, count, amount, currencyLabel, priceLabel, hint, unavailable, browse }: Props) {

    return (

        <Surface elevation="medium" padding={5}>

            <Stack gap={5}>

                <Stack direction="row" align="center" justify="between" gap={3}>

                    <Heading size="title">{title}</Heading>

                    <Text size="small" tone="muted">{count}</Text>

                </Stack>

                <Divider />

                <Stack direction="row" align="center" justify="between" gap={3} wrap>

                    <Text weight="semibold">{priceLabel}</Text>

                    {amount ? <Amount {...amount} currencyLabel={currencyLabel} size="title" />
                        : <Text size="small" tone="muted">{unavailable}</Text>}

                </Stack>

                <Stack direction="row" gap={2}>

                    <Icon name="info" size="sm" tone="muted" />

                    <Text size="small" tone="muted">{hint}</Text>

                </Stack>

                <Link href={browse.href} variant="subtle" width="full"><Icon name="compass" />{browse.label}</Link>

            </Stack>

        </Surface>

    );

}
