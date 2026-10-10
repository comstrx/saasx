"use client";

import Button from "@/elements/button";
import Link from "@/elements/link";
import Pebble from "@/elements/pebble";
import Popover from "@/elements/popover";
import Spinner from "@/elements/spinner";
import Stack from "@/elements/stack";
import { useFavorite } from "@/hooks/use-favorite";
import { useFavoriteLink } from "@/hooks/use-favorite-link";
import type { FavoriteState } from "@/hooks/use-product-favorites";
import Icon from "@/icons/icon";
import FormFeedback from "./form-feedback";

type Props = {
    productId: number; name: string; signIn: string | null; state: FavoriteState; compact?: boolean; tone?: "neutral" | "photo" | "snow";
};

export default function FavoriteButton ({ productId, name, signIn, state, compact = false, tone = "neutral" }: Props) {

    const data = useFavorite({ productId, state });
    const login = useFavoriteLink(signIn);
    const label = data.t("toggle", { name });
    const photo = tone === "photo";
    const touch = tone !== "neutral";
    const heart = <Icon name="heart" size="md" weight={data.saved ? "fill" : "regular"} />;
    const hearts = photo ? <><Icon name="heart" weight="fill" /><Icon name="heart" weight={data.saved ? "fill" : "regular"} /></> : heart;
    const busy = data.pending || data.loading;
    const icon = busy ? <Spinner label={data.t("loading")} size="small" tone={photo ? "inverse" : "accent"} /> : hearts;
    const retryRead = !!data.error && !data.retry;
    const activate = retryRead ? data.refresh : () => { void data.toggle(); };
    const disabled = retryRead ? data.loading : data.disabled;

    if ( !data.visible ) return null;

    if ( data.ready && (!data.token || data.expired) ) {

        if ( !login ) return null;

        if ( compact ) return (

            <Pebble href={login} label={data.t("signInToSave", { name })} shape="round" tone={tone} tooltip={!touch}>{icon}</Pebble>

        );

        return (

            <Link href={login} variant="outlined" aria-label={data.t("signInToSave", { name })}>

                {icon}

                {data.t("save")}

            </Link>

        );

    }

    return (

        <Stack gap={2} align={compact ? "end" : "start"}>

            <Stack direction="row" align="start" gap={2}>

                {compact ? <Pebble
                    id={`${data.id}-control`} label={label} shape="round" tone={tone} tooltip={!touch}
                    pressed={data.saved ?? undefined}
                    disabled={disabled} aria-busy={data.pending || data.loading}
                    aria-describedby={data.error ? data.id : undefined}
                    onClick={activate}
                >{icon}</Pebble> : <Button
                    id={`${data.id}-control`} variant="outlined" aria-label={label}
                    aria-pressed={data.saved ?? undefined} disabled={disabled}
                    aria-describedby={data.error ? data.id : undefined} pending={data.pending} onClick={activate}
                >{data.loading ? icon : heart}{data.t(data.saved ? "savedLabel" : "save")}</Button>}
                {data.error ? <Popover label={data.t("needsAttention")} width="small" trigger={<Icon name="warning" size="sm" />}>

                    <Stack gap={3}>

                        <FormFeedback id={`${data.id}-detail`} error={data.error} />
                        <Button variant="outlined" pending={data.pending} disabled={data.retry && !data.allowed}
                            onClick={activate}>{data.t("retry")}</Button>

                    </Stack>

                </Popover> : null}

            </Stack>
            <FormFeedback id={data.id} message={data.message} error={data.error} hidden={compact} />

        </Stack>

    );

}
