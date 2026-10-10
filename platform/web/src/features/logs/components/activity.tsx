"use client";

import ActivityBoard from "@/components/activity-board";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import { useTranslations } from "@/lib/providers/intl";
import { useActivity } from "../hooks/use-activity";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; art: string; empty: string };
};

export default function Activity ({ title, description, icon, tone, links }: Props) {

    const state = useActivity(links.login);
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

            <ActivityBoard
                tabs={state.tabs} view={state.view} groups={state.groups} loading={state.loading} failed={state.failed} busy={state.busy}
                more={state.more} art={links.empty} editing={state.editing} onEdit={state.setEditing} onReload={state.reload}
                opened={state.opened} onOpen={state.setOpened} selection={state.selection} bulk={state.bulk}
                onSave={() => { void state.save(); }} onRemove={( kind, id ) => { void state.remove(kind, id); }}
                labels={{
                    tabs: t("tabsLabel"), retry: common("retry"), unavailable: t("unavailable"), emptyTitle: t("emptyTitle"),
                    emptyBody: t(`empty.${state.view}`), more: t("more"), actions: t("actions"), edit: t("edit"), remove: t("remove"),
                    save: t("save"), cancel: t("cancel"), editTitle: t("editTitle"), content: t("content"), close: t("close"),
                }}
            />

        </SettingsLayout>

    );

}
