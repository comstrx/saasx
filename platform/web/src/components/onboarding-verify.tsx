"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Form from "@/elements/form";
import OtpInput from "@/elements/otp-input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useOnboardingVerify } from "@/hooks/use-onboarding-verify";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import type { Challenge } from "@/lib/std/auth";

type Props = { challenge: Challenge; onVerified: () => void };

export default function OnboardingVerify ({ challenge, onVerified }: Props) {

    const auth = useTranslations("auth");
    const t = useTranslations("onboarding");
    const data = useOnboardingVerify(challenge, onVerified);

    return (

        <Form pending={data.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void data.submit(); }}>

            <Text tone="muted" wrap="pretty">

                {auth("codeSent", { destination: `\u2068${data.challenge.destination}\u2069`, channel: data.challenge.channel })}

            </Text>

            {data.expired ? <Text role="alert" tone="danger" size="small">{auth("otpExpired")}</Text> : (

                <OtpInput
                    id="onboarding-otp"
                    label={auth("otpLabel")}
                    hint={auth("otpHint")}
                    length={data.challenge.length}
                    value={data.code}
                    disabled={data.pending}
                    slotLabel={( index ) => auth("otpSlot", { index, length: data.challenge.length })}
                    onValueChange={data.setCode}
                />

            )}

            <FormFeedback id="onboarding-otp-failure" error={data.error} message={data.resent ? auth("resent") : null} />

            <Stack direction="row" gap={2} wrap>

                <Button type="submit" pending={data.pending} disabled={!data.ready}><Icon name="check" />{t("verify")}</Button>

                <Button variant="ghost" disabled={data.pending || data.retry > 0} onClick={() => { void data.resend(); }}>

                    {data.retry > 0 ? auth("resendIn", { seconds: data.retry }) : auth("resend")}

                </Button>

            </Stack>

        </Form>

    );

}
