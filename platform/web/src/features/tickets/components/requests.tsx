"use client";

import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import TicketList from "@/components/ticket-list";
import { useTranslations } from "@/lib/providers/intl";
import { useTickets } from "../hooks/use-tickets";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; thread: string; art: string; empty: string };
};

export default function Requests ({ title, description, icon, tone, links }: Props) {

    const state = useTickets(links);
    const { t, form } = state;
    const common = useTranslations("common");

    if ( !state.ready ) return <SectionSkeleton />;

    if ( !state.token ) return (

        <SignInPrompt
            level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
        />

    );

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            <TicketList
                tabs={state.tabs} status={state.status} items={state.items} loading={state.loading} failed={state.failed}
                art={links.empty} more={state.more} onReload={state.reload} selection={state.selection}
                composer={{
                    open: state.composing, pending: state.pending, error: state.error, values: form.values, errors: form.errors,
                    id: form.id, onChange: form.change, onOpenChange: state.setComposing, onSubmit: () => { void state.submit(); },
                }}
                labels={{
                    tabs: t("tabs"), create: t("create"), createTitle: t("createTitle"), createHint: t("createHint"), subject: t("subject"),
                    message: t("message"), send: t("send"), close: t("close"), retry: common("retry"), unavailable: t("unavailable"),
                    emptyTitle: t("emptyTitle"), emptyBody: t("emptyBody"), more: t("more"), order: t("order"),
                }}
            />

        </SettingsLayout>

    );

}
