"use client";

import type { ReactNode } from "react";
import { Check, MagnifyingGlass, X } from "@/lib/providers/icons";
import { Combobox as Base } from "@/lib/providers/ui";

type Option = { value: string; label: string; detail?: string | null; leading?: ReactNode; group?: string };
type Props = {
    id: string;
    label: string;
    placeholder: string;
    query: string;
    value: Option | null;
    options: readonly Option[];
    status?: string | null;
    busy?: boolean;
    leading?: ReactNode;
    look?: "segment" | "field";
    labelVisible?: boolean;
    clear?: string;
    onQueryChange: ( query: string ) => void;
    onSelect: ( value: string | null ) => void;
};

function highlight ( label: string, query: string ): ReactNode {

    const needle = query.trim();
    const at = needle ? label.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase()) : -1;

    if ( at < 0 ) return label;

    return (

        <>

            {label.slice(0, at)}

            <mark className="autocomplete-match">{label.slice(at, at + needle.length)}</mark>

            {label.slice(at + needle.length)}

        </>

    );

}
export default function Autocomplete ({
    id, label, placeholder, query, value, options, status, busy, leading, look = "segment", labelVisible = true, clear,
    onQueryChange, onSelect,
}: Props) {

    const input = (

        <Base.Input
            id={id}
            placeholder={placeholder}
            autoComplete="off"
            className={look === "field" ? "field-input" : [
                "w-full min-w-0 truncate bg-transparent text-value font-semibold text-ink outline-none",
                "placeholder:font-normal placeholder:text-placeholder",
            ].join(" ")}
        />

    );

    return (

        <Base.Root
            items={options}
            value={value}
            inputValue={query}
            filter={null}
            autoHighlight={false}
            itemToStringLabel={( item: Option ) => item.label}
            itemToStringValue={( item: Option ) => item.value}
            isItemEqualToValue={( a, b ) => a.value === b.value}
            onValueChange={( item ) => onSelect(item?.value ?? null)}
            onInputValueChange={( next, details ) => {

                if ( details.reason === "input-change" || details.reason === "input-clear" ) onQueryChange(next);

            }}
        >

            {look === "field" ? (

                <div className="flex min-w-0 flex-col gap-2">

                    <label htmlFor={id} className={labelVisible ? "field-label" : "sr-only"}>{label}</label>

                    <div className="field-shell">

                        <span aria-hidden="true" className="field-affix"><MagnifyingGlass /></span>

                        {input}

                        {query ? (

                            <Base.Clear aria-label={clear} className="field-affix cursor-pointer text-muted hover:text-ink">

                                <X weight="bold" />

                            </Base.Clear>

                        ) : null}

                    </div>

                </div>

            ) : (

                <label htmlFor={id} className="search-segment-label">

                    {leading ? <span aria-hidden="true" className="shrink-0 text-muted">{leading}</span> : null}

                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">

                        <span className="text-label font-semibold text-ink">{label}</span>

                        {input}

                    </span>

                </label>

            )}

            <Base.Portal>

                <Base.Positioner side="bottom" align="start" sideOffset={look === "field" ? 8 : 14} collisionPadding={12} className="z-60">

                    <Base.Popup
                        aria-busy={busy || undefined}
                        hidden={!status && !options.length}
                        className="menu-popup popup-motion popup-frame w-(--anchor-width) min-w-72 thin-scrollbar"
                    >

                        {status ? <Base.Status className="px-3 py-2.5 text-small text-muted">{status}</Base.Status> : null}

                        <Base.List>

                            {( item: Option ) => (

                                <Base.Item key={item.value} value={item} className="menu-item min-h-12 gap-3 py-2">

                                    {item.leading}

                                    <span className="flex min-w-0 flex-1 items-baseline gap-2">

                                        <span className="truncate text-small font-semibold" dir="auto">{highlight(item.label, query)}</span>

                                        {item.detail ? <span className="truncate text-label text-muted">{item.detail}</span> : null}

                                    </span>

                                    <Base.ItemIndicator className="text-accent"><Check weight="bold" /></Base.ItemIndicator>

                                </Base.Item>

                            )}

                        </Base.List>

                    </Base.Popup>

                </Base.Positioner>

            </Base.Portal>

        </Base.Root>

    );

}
