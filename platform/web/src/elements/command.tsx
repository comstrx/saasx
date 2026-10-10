"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";
import { MagnifyingGlass, X } from "@/lib/providers/icons";
import { Combobox, Dialog } from "@/lib/providers/ui";

type Item = { value: string; label: string; detail?: string | null; leading?: ReactNode; trailing?: ReactNode };
type Group = { value: string; label: string; items: readonly Item[] };
type Props = {
    open: boolean;
    onOpenChange: ( open: boolean ) => void;
    title: string;
    placeholder: string;
    close: string;
    clear: string;
    query: string;
    groups: readonly Group[];
    busy?: boolean;
    status?: string | null;
    idle?: ReactNode;
    empty?: ReactNode;
    hints?: { navigate: string; open: string; close: string };
    onQueryChange: ( query: string ) => void;
    onSelect: ( value: string ) => void;
    onSubmit?: ( query: string ) => void;
};

function mark ( label: string, query: string ): ReactNode {

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
export default function Command ({
    open, onOpenChange, title, placeholder, close, clear, query, groups, busy, status, idle, empty, hints, onQueryChange, onSelect,
    onSubmit,
}: Props) {

    const highlighted = useRef<Item | undefined>(undefined);
    const filled = groups.some(( group ) => group.items.length > 0);
    const resting = !query.trim();

    function submit ( event: KeyboardEvent<HTMLInputElement> ) {

        if ( event.key !== "Enter" || highlighted.current || !onSubmit || resting ) return;

        event.preventDefault();
        onSubmit(query.trim());

    }

    return (

        <Dialog.Root open={open} onOpenChange={onOpenChange}>

            <Dialog.Portal>

                <Dialog.Backdrop className="dialog-backdrop" />

                <Dialog.Popup className="command-frame">

                    <Dialog.Title className="sr-only">{title}</Dialog.Title>

                    <Combobox.Root
                        inline
                        open={open}
                        onOpenChange={onOpenChange}
                        items={groups}
                        value={null}
                        inputValue={query}
                        filter={null}
                        autoHighlight={false}
                        itemToStringLabel={( item: Item ) => item.label}
                        itemToStringValue={( item: Item ) => item.value}
                        onItemHighlighted={( item ) => { highlighted.current = item ?? undefined; }}
                        onValueChange={( item ) => { if ( item ) onSelect(item.value); }}
                        onInputValueChange={( next, details ) => {

                            if ( details.reason === "input-change" || details.reason === "input-clear" ) onQueryChange(next);

                        }}
                    >

                        <div className="command-head">

                            <MagnifyingGlass aria-hidden="true" className="size-5 shrink-0 text-muted" />

                            <Combobox.Input
                                aria-label={title}
                                placeholder={placeholder}
                                autoComplete="off"
                                enterKeyHint="search"
                                onKeyDown={submit}
                                className="command-input"
                            />

                            {busy ? (

                                <svg aria-hidden="true" viewBox="0 0 24 24" className="spinner spinner-sm text-primary">

                                    <circle cx="12" cy="12" r="10" />

                                    <circle cx="12" cy="12" r="10" pathLength="100" />

                                </svg>

                            ) : null}

                            {query ? (

                                <Combobox.Clear aria-label={clear} className="btn btn-ghost btn-sm btn-icon btn-pill text-muted">

                                    <X weight="bold" />

                                </Combobox.Clear>

                            ) : null}

                            <Dialog.Close aria-label={close} className="command-escape">esc</Dialog.Close>

                        </div>

                        <div className="command-body thin-scrollbar">

                            {status ? <Combobox.Status className="sr-only">{status}</Combobox.Status> : null}

                            {resting ? idle : null}

                            {!resting && !filled && !busy ? empty : null}

                            <Combobox.List className="command-list">

                                {( group: Group ) => (

                                    <Combobox.Group key={group.value} items={group.items} className="command-group">

                                        <Combobox.GroupLabel className="command-group-label">{group.label}</Combobox.GroupLabel>

                                        <Combobox.Collection>

                                            {( item: Item ) => (

                                                <Combobox.Item key={item.value} value={item} className="command-item">

                                                    {item.leading ? <span className="command-leading">{item.leading}</span> : null}

                                                    <span className="flex min-w-0 flex-1 flex-col">

                                                        <span className="truncate text-value font-semibold text-ink" dir="auto">

                                                            {mark(item.label, query)}

                                                        </span>

                                                        {item.detail ? (

                                                            <span className="truncate text-label text-muted" dir="auto">{item.detail}</span>

                                                        ) : null}

                                                    </span>

                                                    {item.trailing ?? <span aria-hidden="true" className="command-enter">↵</span>}

                                                </Combobox.Item>

                                            )}

                                        </Combobox.Collection>

                                    </Combobox.Group>

                                )}

                            </Combobox.List>

                        </div>

                        {hints ? (

                            <div aria-hidden="true" className="command-foot">

                                <span className="command-hint"><kbd>↑</kbd><kbd>↓</kbd>{hints.navigate}</span>

                                <span className="command-hint"><kbd>↵</kbd>{hints.open}</span>

                                <span className="command-hint"><kbd>esc</kbd>{hints.close}</span>

                            </div>

                        ) : null}

                    </Combobox.Root>

                </Dialog.Popup>

            </Dialog.Portal>

        </Dialog.Root>

    );

}
