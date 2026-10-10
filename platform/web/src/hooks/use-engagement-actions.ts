"use client";

import { useEffect, useState } from "react";
import reviews from "@/api/features/reviews";
import { useBusySignal } from "@/hooks/use-busy-items";
import { useDiscussionAction } from "@/hooks/use-discussion-action";
import { useFormFields } from "@/hooks/use-form-fields";
import { useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { useUi } from "@/stores/provider";

type Feature = "reviews" | "replies" | "comments";
type Mode = "reaction" | "report";
type Choice = "like" | "dislike" | "none" | "";
type Options = {
    feature: Feature; id: number; scope: string; disabled?: boolean;
    onBusy?: ( busy: boolean ) => void; onChanged?: () => void;
};

export function useEngagementActions ( { feature, id, scope, disabled, onBusy, onChanged }: Options ) {

    const t = useTranslations("engagement");
    const user = useUi(( state ) => state.user);
    const permissions = user?.permissions ?? [];
    const canLike = permissions.includes("allow_likes");
    const canDislike = permissions.includes("allow_dislikes");
    const canReport = permissions.includes("add_reports");
    const [mode, setMode] = useState<Mode | null>(null);
    const [choice, setChoice] = useState<Choice>("");
    const [touched, setTouched] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const operation = mode === "report" ? "report" : choice === "none" ? "unreact" : choice === "dislike" ? "dislike" : "like";
    const mutation = useDiscussionAction([scope, "engagement", feature, id].join("."), { feature, operation });
    const active = mutation.attempt ? mutation.attempt.operation === "report" ? "report" : "reaction" : mode;
    const input = feature === "reviews" ? { reviewId: id } : feature === "comments" ? { commentId: id } : { replyId: id };
    const reaction = useRead(feature, "reaction", input, { enabled: active === "reaction" && canLike });
    const current = reaction.data?.reaction ?? null;
    const form = useFormFields({
        initial: { reason: "", title: "", content: "" }, failure: mutation.error, clear: mutation.clear,
        validate: ( values ) => ({
            ...(values.reason.length > 255 ? { reason: t("shortLimit") } : {}),
            ...(values.title.length > 255 ? { title: t("shortLimit") } : {}),
            ...(!values.content.trim() ? { content: t("required") }
                : values.content.length > 65535 ? { content: t("longLimit") } : {}),
        }),
    });
    const busy = !!mutation.attempt || mutation.pending || mutation.blocked;
    const resultId = form.id("result");

    useBusySignal(busy, onBusy);
    useEffect(() => {

        if ( active === "reaction" && canLike && !touched && !reaction.loading && !reaction.error && reaction.data ) {

            setChoice(current ?? "none");

        }

    }, [active, canLike, touched, reaction.loading, reaction.error, reaction.data, current]);
    useEffect(() => { if ( message ) document.getElementById(resultId)?.focus(); }, [message, resultId]);

    function begin ( next: Mode ) {

        if ( disabled || mutation.locked || next === "report" && !canReport || next === "reaction" && !canLike && !canDislike ) return;

        mutation.clear();
        setMessage(null);
        setChoice("");
        setTouched(false);
        setMode(next);

        if ( next === "reaction" ) reaction.reload();

    }
    function choose ( value: string ) {

        if ( mutation.locked || !["like", "dislike", "none"].includes(value) ) return;

        setChoice(value as Choice);
        setTouched(true);
        mutation.clear();

    }
    function close () {

        if ( mutation.locked ) return;

        mutation.clear();
        setMode(null);

    }
    async function submit () {

        if ( disabled ) return;

        if ( !mutation.attempt ) {

            if ( active === "report" && (!canReport || !form.check()) ) return;
            if ( active === "reaction" && (!choice || (choice === "dislike" ? !canDislike : !canLike)) ) return;

            if ( active === "reaction" && canLike && !touched && !reaction.loading && reaction.data
                && !reaction.error && choice === (current ?? "none") ) {

                close();

                return;

            }

        }

        const reporting = active === "report";
        const result = await mutation.run(reporting ? {
            ...input, content: form.values.content.trim(),
            ...(form.values.title.trim() ? { title: form.values.title.trim() } : {}),
            ...(form.values.reason.trim() ? { reason: form.values.reason.trim() } : {}),
        } : input);

        if ( !result ) return;

        const report = reporting ? reviews.report.output.safeParse(result.resource) : null;

        setMessage(report?.success ? t("reported", { id: report.data.id }) : t("reacted"));
        setMode(null);

        if ( reporting ) form.change({ reason: "", title: "", content: "" });

        reaction.reload();
        onChanged?.();

    }

    return {
        t, form, mutation, active, choice, reaction, message, canLike, canDislike, canReport, begin, choose, close, submit,
        locked: !!disabled || mutation.locked,
        error: mutation.blocked ? t("blocked") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t(mutation.error.status === 403 ? "denied" : "failed") : null,
    };

}
