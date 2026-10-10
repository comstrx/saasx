"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAction } from "@/hooks/use-operation";
import { useUi } from "@/stores/provider";

type Options = { articleId: number; likes: number; dislikes: number; favorite: boolean; login: string };

export function useArticleActions ( { articleId, likes, dislikes, favorite, login }: Options ) {

    const router = useRouter();
    const path = usePathname();
    const token = useUi(( state ) => state.token);
    const visit = useAction("articles", "visit");
    const like = useAction("articles", "like");
    const dislike = useAction("articles", "dislike");
    const save = useAction("articles", "favorite");
    const unsave = useAction("articles", "unfavorite");
    const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
    const [saved, setSaved] = useState(favorite);
    const seen = useRef(false);
    const pending = like.pending || dislike.pending || save.pending || unsave.pending;

    useEffect(() => {

        if ( seen.current ) return;

        seen.current = true;
        void visit.run({ articleId });

    }, [articleId, visit]);

    function guard (): boolean {

        if ( token ) return true;

        router.push(`${login}?${new URLSearchParams({ next: path })}` as Route);

        return false;

    }
    async function react ( choice: "like" | "dislike" ) {

        if ( pending || reaction === choice || !guard() ) return;

        const answer = await (choice === "like" ? like : dislike).run({ articleId });

        if ( answer ) setReaction(choice);

    }
    async function toggle () {

        if ( pending || !guard() ) return;

        const answer = await (saved ? unsave : save).run({ articleId });

        if ( answer ) setSaved(!saved);

    }

    return {
        reaction, saved, pending, react, toggle,
        likes: likes + (reaction === "like" ? 1 : 0),
        dislikes: dislikes + (reaction === "dislike" ? 1 : 0),
        failed: Boolean(like.error || dislike.error || save.error || unsave.error),
    };

}
