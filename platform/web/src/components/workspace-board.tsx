"use client";

import FormFeedback from "@/components/form-feedback";
import FormRetry from "@/components/form-retry";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import WorkspaceCard from "@/components/workspace-card";
import WorkspaceEditor from "@/components/workspace-editor";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useWorkspaces } from "@/hooks/use-workspaces";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Tone = "teal" | "blue" | "ember" | "green" | "amber" | "red";
type Props = {
    title: string; description: string; icon?: string | null; tone?: Tone;
    links: { login: string; create: string; plans: string; art: string; empty: string };
};

export default function WorkspaceBoard ({ title, description, icon, tone, links }: Props) {

    const data = useWorkspaces(links);
    const common = useTranslations("common");
    const { t, asked } = data;
    const confirming = asked && asked.kind !== "edit" ? asked : null;
    const kind = asked?.kind === "renew" || asked?.kind === "bulk" ? asked.kind : "delete";

    if ( !data.ready ) return <SectionSkeleton />;

    if ( !data.token ) return (

        <SignInPrompt level={1} title={title} description={t("signInBody")} href={data.login} label={t("signIn")} art={links.art} />

    );

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            <Stack gap={6}>

                <Stack direction="responsive" justify="between" align="center" gap={3}>

                    <Text size="small" tone="muted">{t("count", { count: data.items.length })}</Text>

                    <Stack direction="row" gap={2} wrap>

                        {data.selected.length > 1 ? (

                            <Button variant="danger" size="small" onClick={() => data.ask("bulk", { id: 0, name: "" })}>

                                <Icon name="trash" />{t("deleteSelected", { count: data.selected.length })}

                            </Button>

                        ) : null}

                        <Link href={data.create} variant="filled" size="medium" shape="pill"><Icon name="plus" />{t("create")}</Link>

                    </Stack>

                </Stack>

                {data.failed ? (

                    <FormRetry id="workspaces-read" message={common("failedBody")} label={common("retry")} onRetry={data.reload} />

                ) : null}

                {data.loading ? <SectionSkeleton /> : null}

                {!data.loading && !data.failed && !data.items.length ? (

                    <StateNotice
                        art={links.empty}
                        title={t("emptyTitle")}
                        description={t("emptyBody")}
                        action={(

                            <Link href={data.plans} variant="outlined" size="medium" shape="pill">

                                <Icon name="crown" />{t("seePlans")}

                            </Link>

                        )}
                    />

                ) : null}

                {data.items.length ? (

                    <Stack as="ul" gap={4} aria-label={title}>

                        {data.items.map(( item ) => (

                            <WorkspaceCard
                                key={item.id}
                                item={item}
                                selectable={data.items.length > 1}
                                selected={data.selected.includes(item.id)}
                                onSelect={( value ) => data.pick(item.id, value)}
                                onEdit={() => data.ask("edit", item)}
                                onRenew={() => data.ask("renew", item)}
                                onDelete={() => data.ask("delete", item)}
                            />

                        ))}

                    </Stack>

                ) : null}

            </Stack>

            <WorkspaceEditor
                tenantId={asked?.kind === "edit" ? asked.id : null}
                onClose={data.close}
                onDone={() => { data.close(); data.reload(); }}
            />

            <Dialog
                open={!!confirming}
                onOpenChange={( open ) => { if ( !open ) data.close(); }}
                title={t(`confirm.${kind}.title`, { name: confirming?.name ?? "", count: data.selected.length })}
                close={t("close")}
                dismissible={!data.pending}
                footer={(

                    <>

                        <Button variant="ghost" disabled={data.pending} onClick={data.close}>{t("close")}</Button>

                        <Button
                            variant={kind === "renew" ? "filled" : "danger"}
                            pending={data.pending}
                            onClick={() => { void data.confirm(); }}
                        >

                            {t(`confirm.${kind}.action`)}

                        </Button>

                    </>

                )}
            >

                <Stack gap={4}>

                    <Text tone="muted" wrap="pretty">{t(`confirm.${kind}.body`)}</Text>

                    <FormFeedback id="workspace-confirm-failure" error={data.error} />

                </Stack>

            </Dialog>

        </SettingsLayout>

    );

}
