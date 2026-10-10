"use client";

import NotificationDetails from "@/components/notification-details";
import NotificationInbox from "@/components/notification-inbox";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import { useTranslations } from "@/lib/providers/intl";
import { useInbox } from "../hooks/use-inbox";

type Links = { login: string; order: string; ticket: string; wallet: string; art: string; empty: string };
type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: Links;
};

export default function Inbox ({ title, description, icon, tone, links }: Props) {

    const state = useInbox(links);
    const { t } = state;
    const common = useTranslations("common");

    if ( !state.ready ) return <SectionSkeleton />;

    if ( !state.token ) return (

        <SignInPrompt
            level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
        />

    );

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            <NotificationInbox
                tabs={state.tabs} show={state.show} groups={state.groups} loading={state.loading} failed={Boolean(state.error)}
                busy={state.busy} unread={state.unread} art={links.empty} more={state.more}
                labels={{
                    tabs: t("tabs"), readAll: t("readAll"), read: t("read"), unread: t("unread"), pin: t("pin"), unpin: t("unpin"),
                    delete: t("delete"), actions: t("actions"), pinned: t("pinned"), more: t("more"), retry: common("retry"),
                    unavailable: t("unavailable"), emptyTitle: t("emptyTitle"), emptyBody: t("emptyBody"), working: common("loading"),
                }}
                onReload={state.reload} onReadAll={() => { void state.readAll(); }}
                selection={{
                    ids: state.selected, pick: state.pick, clear: state.clearSelection, run: state.bulk,
                    labels: {
                        select: ( title: string ) => t("select", { title }), count: t("selected", { count: state.selected.length }),
                        clear: t("clearSelection"), read: t("markRead"), unread: t("markUnread"), pin: t("pin"), delete: t("delete"),
                    },
                }}
                onRead={( id, read ) => { void state.toggleRead(id, read); }}
                onPin={( id, pinned ) => { void state.togglePin(id, pinned); }}
                onRemove={state.remove}
                onOpen={state.setOpened}
            />

            <NotificationDetails notificationId={state.opened} onClose={() => state.setOpened(null)} />

        </SettingsLayout>

    );

}
