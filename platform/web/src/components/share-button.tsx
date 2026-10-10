"use client";

import Pebble from "@/elements/pebble";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useShare } from "@/hooks/use-share";
import Icon from "@/icons/icon";

type Props = { title: string; labels: { label: string; copied: string; failed: string }; tone?: "neutral" | "snow" };

export default function ShareButton ({ title, labels, tone = "neutral" }: Props) {

    const snow = tone === "snow";
    const { share, outcome } = useShare(title, snow ? labels : undefined);

    if ( snow ) return (

        <Pebble label={labels.label} shape="round" tone="snow" tooltip={false} onClick={share}><Icon name="share" /></Pebble>

    );

    return (

        <Stack direction="row" align="center" gap={2}>

            <Text as="span" size="label" tone={outcome === "failed" ? "danger" : "muted"} role="status">

                {outcome === "idle" ? "" : labels[outcome]}

            </Text>

            <Pebble label={labels.label} shape="round" onClick={share}><Icon name="share" /></Pebble>

        </Stack>

    );

}
