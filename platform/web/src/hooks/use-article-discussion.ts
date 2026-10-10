"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction, useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { orderDate } from "@/lib/std/orders";
import { hasNextPage } from "@/lib/std/route";
import { useUi } from "@/stores/provider";

const size = 10;

export function useArticleDiscussion ( articleId: number, login: string ) {

    const t = useTranslations("articles");
    const locale = useLocale();
    const path = usePathname();
    const ready = useUi(( state ) => state.ready);
    const user = useUi(( state ) => (state.token ? state.user : null));
    const [limit, setLimit] = useState(size);
    const [notice, setNotice] = useState<string | null>(null);
    const request = useRead("articles", "comments", { articleId, page: 1, limit });
    const action = useAction("articles", "comment");
    const form = useFormFields({
        initial: { title: "", content: "" }, failure: action.error, clear: action.clear,
        validate: ( values ): Record<string, string> => !values.content.trim() ? { content: t("required") }
            : values.content.length > 10000 ? { content: t("tooLong") } : {},
    });
    const items = (request.data ?? []).map(( comment ) => ({
        id: comment.id,
        name: comment.user?.name || t("guest"),
        image: comment.user?.image ?? null,
        content: comment.content ?? "",
        date: orderDate(comment.created_at, locale) ?? null,
        rating: null,
        replies: comment.replies ?? 0,
        likes: comment.likes ?? 0,
        dislikes: comment.dislikes ?? 0,
    }));
    const total = request.meta?.pagination?.total;

    async function send () {

        setNotice(null);

        if ( !form.check() ) return;

        const answer = await action.run({ articleId, content: form.values.content.trim() });

        if ( !answer ) return;

        form.reset({ title: "", content: "" });
        setNotice(t("posted"));
        request.reload();

    }

    return {
        t, form, items, notice, send, ready, signedIn: Boolean(user),
        login: `${login}?${new URLSearchParams({ next: `${path}#discussion` })}`,
        pending: action.pending,
        loading: request.loading && !request.data,
        failed: Boolean(request.error),
        reload: request.reload,
        error: action.error ? Object.values(action.error.errors).flat()[0] || t("failed") : null,
        more: hasNextPage(request.meta?.pagination, items.length, limit) ? () => setLimit(( value ) => value + size) : null,
        count: total != null ? t("comments", { count: total }) : null,
    };

}
