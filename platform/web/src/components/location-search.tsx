"use client";

import { useId } from "react";
import Autocomplete from "@/elements/autocomplete";
import Icon from "@/icons/icon";
import type { SearchPlace } from "@/lib/std/search";

type Props = {
    label: string;
    placeholder: string;
    query: string;
    value: SearchPlace | null;
    items: readonly SearchPlace[];
    busy?: boolean;
    status?: string | null;
    onQueryChange: ( query: string ) => void;
    onSelect: ( place: SearchPlace | null ) => void;
};

export default function LocationSearch ({ label, placeholder, query, value, items, busy, status, onQueryChange, onSelect }: Props) {

    const id = useId();
    const choice = ( item: SearchPlace ) => ({
        value: `${item.kind}:${item.id}`,
        label: item.label,
        detail: item.detail,
        leading: <Icon name={item.kind === "geo" ? "pin" : item.kind === "category" ? "compass" : "bag"} size="md" />,
    });

    return (

        <Autocomplete
            id={id}
            label={label}
            placeholder={placeholder}
            query={query}
            value={value ? choice(value) : null}
            options={items.map(choice)}
            busy={busy}
            status={status}
            onQueryChange={onQueryChange}
            onSelect={( key ) => onSelect(items.find(( item ) => `${item.kind}:${item.id}` === key) ?? null)}
        />

    );

}
