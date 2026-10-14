import { useCallback } from "react";
import Emoji from "@/elements/emoji";
import Input from "@/elements/input";
import Select from "@/elements/select";
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

    const tile = useCallback(( pick: Pick ) => <Emoji glyph={pick.glyph} label={pick.label} onPress={onPick} />, [onPick]);

    return (

        <Stack gap={2} fill>

            <Input name="emoji-search" kind="search" value={query} placeholder={placeholder} onChange={onQuery} />

            <Select name="emoji-groups" value={query ? "" : group} choices={groups.map(( choice ) => ({ value: choice.key, label: choice.label }))} onChange={onGroup} />

            <Tiles items={picks} side={48} keyOf={keyOf} render={tile} empty={<Text text={empty} tone="muted" />} />

        </Stack>

    );

}
