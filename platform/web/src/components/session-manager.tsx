"use client";

import FactList from "@/components/fact-list";
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
import { useSessionManager } from "@/hooks/use-session-manager";
import Icon from "@/icons/icon";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { day } from "@/lib/std/format";

export default function SessionManager () {

    const data = useSessionManager();
    const { t, request } = data;
    const locale = useLocale();
    const common = useTranslations("common");
    const stamp = ( value: string ) => day(value, locale, { dateStyle: "medium", timeStyle: "short" });
    const removal = data.removal;

    return (

        <Stack gap={5}>

            <FormFeedback id={data.id} message={data.notice} />

            {request.loading && !request.data ? <SectionSkeleton /> : null}

            {request.error ? (

                <FormRetry id={`${data.id}-read`} message={common("failedBody")} label={common("retry")} onRetry={request.reload} />

            ) : null}

            {!request.loading && !request.error && !data.items.length ? <Text tone="muted">{t("noSessions")}</Text> : null}

            {data.items.length ? (

                <Stack as="ul" gap={0} aria-label={t("sessionsTitle")}>

                    {data.items.map(( item ) => (

                        <SettingRow
                            key={item.id}
                            select={item.is_me || data.items.length < 3 ? null : {
                                id: `${data.id}-select-${item.id}`, label: t("selectSession", { name: data.device(item).label }),
                                checked: data.selected.includes(item.id), disabled: data.pending,
                                onChange: ( value ) => data.pick(item.id, value),
                            }}
                            media={(

                                <Emblem tone={item.is_me ? "teal" : "neutral"} look="flat"><Icon name={data.device(item).icon} /></Emblem>

                            )}
                            title={<Text as="span" weight="semibold" dir="auto">{data.device(item).label}</Text>}
                            meta={item.is_me ? <Status tone="positive">{t("currentSession")}</Status> : null}
                            description={(

                                <Stack gap={0}>

                                    {item.ip ? (

                                        <Text size="small" tone="muted">

                                            <Text as="span" size="small" tone="muted" dir="ltr">{item.ip}</Text>

                                        </Text>

                                    ) : null}

                                    {item.last_used_at ? (

                                        <Text size="small" tone="muted">{t("lastUsed", { date: stamp(item.last_used_at) })}</Text>

                                    ) : null}

                                </Stack>

                            )}
                            action={(

                                <Stack direction="row" gap={1} align="center" wrap>

                                    <Button
                                        variant="ghost" size="small" rounded="full" icon
                                        aria-label={t("sessionDetails", { name: data.device(item).label })}
                                        onClick={() => data.inspect(item.id)}
                                    >

                                        <Icon name="info" />

                                    </Button>

                                    {item.is_me ? (

                                        <Button
                                            variant="ghost" size="small" disabled={data.pending} onClick={data.askRenew}
                                        >

                                            <Icon name="refresh" />{t("renew")}

                                        </Button>

                                    ) : null}

                                    <Button
                                        variant="ghost"
                                        size="small"
                                        disabled={data.pending || request.loading}
                                        aria-label={t("signOutDevice", { name: data.device(item).label })}
                                        onClick={() => data.ask({ kind: "one", item })}
                                    >

                                        <Icon name="sign-out" />{t(item.is_me ? "signOutHere" : "signOut")}

                                    </Button>

                                </Stack>

                            )}
                        />

                    ))}

                </Stack>

            ) : null}

            {data.items.length ? (

                <Stack direction="row" gap={2} wrap>

                    {data.selected.length ? (

                        <Button
                            variant="danger"
                            size="small"
                            disabled={data.pending}
                            onClick={() => data.ask({ kind: "many", ids: data.selected })}
                        >

                            <Icon name="sign-out" />{t("signOutSelected", { count: data.selected.length })}

                        </Button>

                    ) : null}

                    {data.others ? (

                        <Button variant="outlined" size="small" disabled={data.pending} onClick={() => data.ask({ kind: "others" })}>

                            <Icon name="devices" />{t("signOutOthers")}

                        </Button>

                    ) : null}

                    <Button variant="ghost" size="small" disabled={data.pending} onClick={() => data.ask({ kind: "all" })}>

                        <Icon name="sign-out" />{t("signOutAll")}

                    </Button>

                </Stack>

            ) : null}

            <Dialog
                open={!!removal}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t(removal?.kind === "all" ? "signOutAllTitle" : "signOutTitle")}
                close={t("cancel")}
                dismissible={!data.pending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.pending} onClick={data.close}>{t("cancel")}</Button>

                        <Button
                            variant={removal?.kind === "all" ? "danger" : "filled"}
                            pending={data.pending}
                            onClick={() => { void data.remove(); }}
                        >

                            {t(data.error ? "retry" : removal?.kind === "all" ? "signOutAll" : "signOut")}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Text tone="muted" wrap="pretty">

                        {removal?.kind === "many" ? t("manyBody", { count: removal.ids.length }) : t(removal?.kind === "all" ? "allBody"
                            : removal?.kind === "others" ? "othersBody" : removal?.item.is_me ? "currentBody" : "oneBody")}

                    </Text>

                    {removal?.kind === "one" ? (

                        <Text weight="semibold" wrap="anywhere" dir="auto">{data.device(removal.item).label}</Text>

                    ) : null}

                    <FormFeedback id={`${data.id}-failure`} error={data.error} />

                </Stack>

            </Dialog>

            <Dialog
                open={data.renewing}
                onOpenChange={( open ) => { if ( !open ) data.cancelRenew(); }}
                title={t("renewTitle")}
                description={t("renewBody")}
                close={t("cancel")}
                dismissible={!data.extending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.extending} onClick={data.cancelRenew}>{t("cancel")}</Button>

                        <Button pending={data.extending} onClick={() => { void data.extend(); }}>

                            <Icon name="refresh" />{t("renew")}

                        </Button>

                    </>

                )}
            >

                <Text size="small" tone="muted">{t("renewHint")}</Text>

            </Dialog>

            <Dialog
                open={data.inspected != null}
                onOpenChange={( open ) => { if ( !open ) data.inspect(null); }}
                title={data.detail.data ? data.device(data.detail.data).label : t("sessionTitle")}
                close={t("cancel")}
            >

                {data.detail.failed ? (

                    <FormRetry
                        id={`${data.id}-detail`} message={common("failedBody")} label={common("retry")} onRetry={data.detail.reload}
                    />

                ) : data.detail.loading || !data.detail.data ? <SectionSkeleton /> : (

                    <FactList
                        compact
                        items={[
                            { key: "ip", term: t("detailIp"), detail: data.detail.data.ip ?? undefined, icon: "globe" },
                            {
                                key: "created", term: t("detailCreated"), icon: "sign-in",
                                detail: data.detail.data.created_at ? stamp(data.detail.data.created_at) : undefined,
                            },
                            {
                                key: "used", term: t("detailUsed"), icon: "clock",
                                detail: data.detail.data.last_used_at ? stamp(data.detail.data.last_used_at) : undefined,
                            },
                            {
                                key: "expires", term: t("detailExpires"), icon: "hourglass",
                                detail: data.detail.data.expires_at ? stamp(data.detail.data.expires_at) : t("detailNever"),
                            },
                        ].filter(( fact ) => fact.detail)}
                    />

                )}

            </Dialog>

        </Stack>

    );

}
