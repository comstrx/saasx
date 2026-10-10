"use client";

import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";
import { useUi } from "@/stores/provider";

export type Reacting = "levels" | "orders";

export function useReaction ( feature: Reacting, id: number ) {

    const t = useTranslations("engage");
    const toast = useToast();
    const signed = useUi(( state ) => Boolean(state.token));
    const input = { levels: { levelId: id }, orders: { orderId: id } }[feature];
    const current = useRead(feature, "reaction", input, { enabled: signed && id > 0 });
    const like = useAction(feature, "like");
    const dislike = useAction(feature, "dislike");
    const unreact = useAction(feature, "unreact");
    const chosen = current.data?.reaction ?? null;
    const pending = like.pending || dislike.pending || unreact.pending;

    async function choose ( value: "like" | "dislike" ) {

        if ( pending ) return;

        const answer = await (chosen === value ? unreact : value === "like" ? like : dislike).run(input);

        if ( !answer ) {

            toast({ title: t("failed"), tone: "error" });
            return;

        }

        current.reload();

    }

    return { chosen, pending, ready: signed && !current.loading, choose };

}
