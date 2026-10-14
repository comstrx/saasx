"use client";

import { useCallback, useId } from "react";
import Button from "@/elements/button";
import Emoji from "@/elements/emoji";
import Input from "@/elements/input";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Tiles from "@/elements/tiles";

export type Choice = { key: string; label: string };
export type Pick = { glyph: string; label: string };

type Props = {
    placeholder: string;
    empty: string;
    query: string;
    onQuery: ( value: string ) => void;
    groups: readonly Choice[];
    group: string;
    onGroup: ( key: string ) => void;
    picks: readonly Pick[];
    onPick: ( glyph: string ) => void;
};

function keyOf ( pick: Pick ): string {

    return pick.glyph;

}
export default function EmojiPicker ({ placeholder, empty, query, onQuery, groups, group, onGroup, picks, onPick }: Props) {

    const id = useId();
    const tile = useCallback(( pick: Pick ) => <Emoji glyph={pick.glyph} label={pick.label} onPress={onPick} />, [onPick]);

    return (

        <Stack gap={3}>

            <Input id={`${id}-search`} name="emoji" kind="search" value={query} placeholder={placeholder} onChange={onQuery} />

            <Stack direction="row" gap={2}>

                {groups.map(( choice ) => <Button key={choice.key} label={choice.label} tone={choice.key === group && !query ? "primary" : "ghost"} onPress={() => onGroup(choice.key)} />)}

            </Stack>

            {picks.length ? <Tiles items={picks} keyOf={keyOf} render={tile} /> : <Text text={empty} tone="muted" />}

        </Stack>

    );

}
