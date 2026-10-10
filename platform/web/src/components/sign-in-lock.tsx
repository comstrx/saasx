"use client";

import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import SettingRow from "@/elements/setting-row";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useSignInLock } from "@/hooks/use-sign-in-lock";
import Icon from "@/icons/icon";
import ConfirmCode from "./confirm-code";
import FormFeedback from "./form-feedback";
import PasswordField from "./password-field";

type Props = { hasPassword: boolean };

export default function SignInLock ({ hasPassword }: Props) {

    const data = useSignInLock(hasPassword);
    const { t, confirmation } = data;

    return (

        <>

            <SettingRow
                media={<Emblem tone="amber" look="flat"><Icon name="lock" /></Emblem>}
                title={<Text as="span" weight="semibold">{t("lockTitle")}</Text>}
                description={<Text size="small" tone="muted">{t("lockBody")}</Text>}
                action={<Button variant="outlined" size="small" onClick={data.ask}><Icon name="key" />{t("lockAction")}</Button>}
            />

            <Dialog
                open={data.open}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t("lockTitle")}
                description={t("lockDialog")}
                close={t("cancel")}
                dismissible={!data.pending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.pending} onClick={data.close}>{t("cancel")}</Button>

                        <Button pending={data.pending} onClick={() => { void data.submit(); }}><Icon name="key" />{t("lockAction")}</Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    {hasPassword ? (

                        <PasswordField
                            id="unlock-password" label={t("closurePassword")} autoComplete="current-password" value={data.password}
                            disabled={data.pending} onChange={( event ) => data.setPassword(event.target.value)}
                        />

                    ) : confirmation.challenge ? (

                        <ConfirmCode
                            id={confirmation.id} challenge={confirmation.challenge} code={confirmation.code} retry={confirmation.retry}
                            expired={confirmation.expired} disabled={data.pending} onCode={confirmation.setCode}
                            onResend={() => { void data.submit(true); }}
                        />

                    ) : <Text size="small" tone="muted">{t("closureCodeHint")}</Text>}

                    <FormFeedback id="unlock-failure" error={data.error} />

                </Stack>

            </Dialog>

        </>

    );

}
