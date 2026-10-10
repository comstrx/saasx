"use client";

import type cart from "@/api/features/cart";
import Button from "@/elements/button";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useBusySignal } from "@/hooks/use-busy-items";
import { useSaveCart } from "@/hooks/use-save-cart";
import Icon from "@/icons/icon";
import { useLocale } from "@/lib/providers/intl";
import type { z } from "@/lib/providers/schema";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import AttemptRecovery from "./attempt-recovery";
import FormFeedback from "./form-feedback";

type Props = {
    input: z.input<typeof cart.add.input>; href: string; validate: () => boolean; disabled?: boolean; onBusy?: ( busy: boolean ) => void;
};

export default function SaveToCart ({ input, href, validate, disabled, onBusy }: Props) {

    const state = useSaveCart(input, validate, disabled);
    const { t, mutation } = state;
    const locale = useLocale();

    useBusySignal(!!mutation.attempt || mutation.pending || mutation.blocked, onBusy);

    if ( !state.allowed && !mutation.attempt ) return null;

    return (

        <Stack gap={3}>

            {mutation.attempt || mutation.blocked ? <AttemptRecovery
                title={t("recoveryTitle")}
                        description={t(!state.allowed ? "deniedBody" : mutation.blocked ? "blocked" : "recovery")}
                label={t("retry")} pending={mutation.pending}
                blocked={mutation.blocked || !!disabled || !state.allowed} onRetry={state.save}
            /> : <Button variant="outlined" width="full" disabled={disabled || mutation.locked} pending={mutation.pending}
                onClick={() => { void state.save(); }}><Icon name="bag" size="sm" />{t("save")}</Button>}
            <Text size="small" tone="muted">{t("saveHint")}</Text>
            <FormFeedback id={`save-cart-${input.productId}`} error={state.error} message={state.saved ? t("saved") : null} />
            {state.saved ? (

                <Stack direction="row" align="center" justify="between" gap={3} wrap>

                    <Link href={localePath(locale, href, routing)} variant="quiet">{t("view")}</Link>

                    <Button variant="link" size="small" pending={state.removing} onClick={() => { void state.unsave(); }}>

                        {t("unsave")}

                    </Button>

                </Stack>

            ) : null}

        </Stack>

    );

}
