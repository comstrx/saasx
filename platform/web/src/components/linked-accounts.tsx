"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Emblem from "@/elements/emblem";
import SettingRow from "@/elements/setting-row";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Text from "@/elements/text";
import { useLinkedAccounts } from "@/hooks/use-linked-accounts";
import Icon, { isIconName } from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = { hasPassword: boolean };

export default function LinkedAccounts ({ hasPassword }: Props) {

    const data = useLinkedAccounts(hasPassword);
    const common = useTranslations("common");
    const { t } = data;

    return (

        <Stack gap={5}>

            {data.failed ? (

                <FormRetry id="linked-read" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

            ) : null}

            {data.loading ? <SectionSkeleton /> : null}

            {!data.loading && !data.failed && !data.rows.length ? <Text size="small" tone="muted">{t("socialNone")}</Text> : null}

            {data.rows.length ? (

                <Stack as="ul" gap={0} aria-label={t("socialTitle")}>

                    {data.rows.map(( row ) => (

                        <SettingRow
                            key={row.provider}
                            media={(

                                <Emblem tone="neutral" look="flat">

                                    <Icon name={isIconName(row.glyph) ? row.glyph : "link"} weight="bold" />

                                </Emblem>

                            )}
                            title={row.name}
                            meta={row.linked ? (

                                <Status tone="positive" icon={<Icon name="check-circle" size="sm" weight="fill" />}>

                                    {t("socialConnected")}

                                </Status>

                            ) : null}
                            description={row.linked && row.detail ? <Text as="span" size="small" tone="muted" dir="auto">{row.detail}</Text>
                                : t(row.linked ? "socialConnectedBody" : "socialIdle", { provider: row.name })}
                            action={row.linked ? (

                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={row.last || data.unlinking}
                                    aria-label={t("socialDisconnectNamed", { provider: row.name })}
                                    onClick={() => data.ask(row.provider)}
                                >

                                    <Icon name="unlink" />{t("socialDisconnect")}

                                </Button>

                            ) : (

                                <Button
                                    variant="outlined"
                                    size="small"
                                    pending={data.linking && data.selected === row.provider}
                                    disabled={data.linking}
                                    aria-label={t("socialConnectNamed", { provider: row.name })}
                                    onClick={() => { void data.connect(row.provider); }}
                                >

                                    <Icon name="link" />{t("socialConnect")}

                                </Button>

                            )}
                        />

                    ))}

                </Stack>

            ) : null}

            {data.locked ? <Text size="small" tone="muted">{t("socialLastHint")}</Text> : null}

            <FormFeedback id="linked-failure" error={data.linkError} />

            <Dialog
                open={!!data.removal}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t("socialRemoveTitle", { provider: data.removing })}
                close={t("cancel")}
                dismissible={!data.unlinking}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.unlinking} onClick={data.close}>{t("cancel")}</Button>

                        <Button variant="danger" pending={data.unlinking} onClick={() => { void data.disconnect(); }}>

                            <Icon name="unlink" />{t(data.unlinkError ? "retry" : "socialDisconnect")}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Text tone="muted" wrap="pretty">{t("socialRemoveBody", { provider: data.removing })}</Text>

                    <FormFeedback id="linked-remove-failure" error={data.unlinkError} />

                </Stack>

            </Dialog>

        </Stack>

    );

}
