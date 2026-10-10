"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Divider from "@/elements/divider";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useSocialSignIn } from "@/hooks/use-social-sign-in";
import Icon, { isIconName } from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { callback: string; next: string; disabled?: boolean };

export default function SocialSignIn ({ callback, next, disabled }: Props) {

    const t = useTranslations("auth");
    const state = useSocialSignIn(callback, next);

    if ( state.loading || (!state.failed && !state.options.length) ) return null;

    return (

        <Stack gap={3}>

            <Divider label={t("or")} />

            {state.failed ? <Text size="small" tone="muted" align="center">{t("socialUnavailable")}</Text> : null}

            {state.failed ? <Button variant="outlined" onClick={state.reload}>{t("tryAgain")}</Button> : null}

            {state.options.map(( provider ) => (

                <Button
                    key={provider.value} variant="outlined" size="large" width="full" disabled={disabled || state.pending}
                    pending={state.pending && state.selected === provider.value} onClick={() => state.start(provider.value)}
                >

                    {isIconName(provider.glyph) ? <Icon name={provider.glyph} weight="bold" /> : null}

                    {t("socialContinue", { provider: provider.label })}

                </Button>

            ))}

            {state.error ? <FormFeedback id="social-failure" error={state.error} /> : null}

        </Stack>

    );

}
