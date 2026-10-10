"use client";

import { usePathname, useSearchParams } from "next/navigation";
import SectionSkeleton from "@/components/section-skeleton";
import SignInPrompt from "@/components/sign-in-prompt";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

type Props = { title: string; login: string; register: string; art: string };

export default function Prompt ({ title, login, register, art }: Props) {

    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const locale = useLocale();
    const path = usePathname();
    const query = useSearchParams();
    const t = useTranslations("auth");
    const next = `${path}${query.size ? `?${query}` : ""}`;
    const href = `${localePath(locale, login, routing)}?${new URLSearchParams({ next })}`;
    const join = `${localePath(locale, register, routing)}?${new URLSearchParams({ next })}`;

    if ( !ready ) return <SectionSkeleton />;
    if ( token ) return null;

    return (

        <SignInPrompt
            level={1} title={title} description={t("personalPrompt")} label={t("signIn")} href={href} art={art}
            register={{ href: join, label: t("register") }}
        />

    );

}
