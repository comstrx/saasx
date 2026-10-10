"use client";

import { useEffect, useId, useState } from "react";
import { bulk } from "@/api/core/fields";
import type { Data } from "@/api/features";
import { useAction } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { useUi } from "@/stores/provider";

type Item = Data<"favorites", "view">;
type Removal = { ids: number[]; single: boolean; name?: string };

export function useFavoriteManager ( items: readonly Item[], loading: boolean ) {

    const t = useTranslations("favorites");
    const user = useUi(( state ) => state.user);
    const token = useUi(( state ) => state.token);
    const one = useAction("favorites", "delete");
    const many = useAction("favorites", "deleteMany");
    const [selected, setSelected] = useState<number[]>([]);
    const [removal, setRemoval] = useState<Removal | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const id = useId();
    const chosen = selected.filter(( value ) => items.some(( item ) => item.id === value));
    const allowed = !!token && user?.permissions?.includes("delete_favorites") === true;
    const action = removal?.single ? one : many;
    const pending = one.pending || many.pending;
    const error = action.error ? Object.values(action.error.errors).flat()[0] || t("removeFailed") : null;

    useEffect(() => { if ( message ) document.getElementById(id)?.focus(); }, [message, id]);

    function select ( target: number, checked: boolean ) {

        if ( !allowed || loading || pending ) return;

        setSelected(( values ) => checked ? [...new Set([...values, target])].slice(0, 100) : values.filter(( id ) => id !== target));

    }
    function selectPage () {

        if ( !allowed || loading || pending ) return;

        setSelected(chosen.length === items.length ? [] : items.map(( item ) => item.id).slice(0, 100));

    }
    function ask ( target: Removal ) {

        if ( !allowed || loading || pending || !target.ids.length ) return;

        one.clear();
        many.clear();
        setMessage(null);
        setRemoval(target);

    }
    function close () {

        if ( pending ) return;

        setRemoval(null);
        one.clear();
        many.clear();

    }
    async function remove () {

        if ( !allowed || pending || !removal ) return;

        const first = removal.ids[0];

        if ( first === undefined ) return;

        const result = removal.single ? await one.run({ favoriteId: first }) : await many.run({ ids: removal.ids });

        if ( !result ) return;

        const report = bulk.safeParse(result.resource);
        const missed = report.success ? report.data.missed_ids ?? [] : [];

        setSelected(missed);
        setMessage(missed.length ? t("partialRemoval", { count: missed.length }) : t("removed"));
        setRemoval(null);

    }

    return { t, id, selected: chosen, select, selectPage, ask, close, remove, removal, allowed, pending, error, message };

}
