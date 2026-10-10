"use client";

import { useEffect, useId, useState } from "react";

export type ListValues = { query: string; status: string; sort: string };

export function useListControls ( values: ListValues ) {

    const prefix = useId();
    const { query, status, sort } = values;
    const [draft, setDraft] = useState(values);

    useEffect(() => { setDraft({ query, status, sort }); }, [query, status, sort]);

    return {
        draft, id: ( key: string ) => `${prefix}-${key}`,
        change: ( patch: Partial<ListValues> ) => setDraft(( previous ) => ({ ...previous, ...patch })),
    };

}
