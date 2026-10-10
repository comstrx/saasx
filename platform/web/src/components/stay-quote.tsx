import Amount from "@/elements/amount";
import Button from "@/elements/button";
import Divider from "@/elements/divider";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { StayQuoteData } from "@/hooks/use-stay-quote";

type Props = { data: StayQuoteData; currencyLabel: string };

export default function StayQuote ({ data, currencyLabel }: Props) {

    const blocked = Boolean(data.retry) || data.state === "unavailable";

    if ( !data.quote ) return (

        <Stack gap={2}>

            <Text size="small" tone={blocked ? "danger" : "muted"} role={data.retry ? "alert" : "status"}>

                {data.message}

            </Text>

            {data.retry ? <Button variant="outlined" size="small" onClick={data.retry.run}>{data.retry.label}</Button> : null}

        </Stack>

    );

    return (

        <Stack gap={3} role="status">

            <Stack direction="row" align="center" justify="between" gap={3}>

                <Stack direction="row" align="baseline" gap={1}>

                    <Amount {...data.quote.nightly} currencyLabel={currencyLabel} size="small" tone="inherit" />

                    <Text as="span" size="small">{data.quote.nights}</Text>

                </Stack>

                {data.quote.total ? <Amount {...data.quote.total} currencyLabel={currencyLabel} size="small" tone="inherit" /> : null}

            </Stack>

            <Divider />

            <Stack direction="row" align="center" justify="between" gap={3}>

                <Text as="span" weight="semibold">{data.quote.totalLabel}</Text>

                {data.quote.total ? <Amount {...data.quote.total} currencyLabel={currencyLabel} size="base" /> : null}

            </Stack>

        </Stack>

    );

}
