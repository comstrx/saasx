import { Fragment, useMemo, useState } from "react";
import { View } from "react-native";
import { Check } from "@/elements/check";
import { Empty } from "@/elements/empty";
import { Flag } from "@/elements/flag";
import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Search } from "@/elements/search";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { str } from "@/std/str";
import { useTheme } from "@/theme/use-theme";

export type Option = {
    key: string;
    label: string;
    note?: string | undefined;
    icon?: IconName | undefined;
    figure?: string | undefined;
    flag?: string | undefined;
    group?: string | undefined;
    terms?: readonly string[] | undefined;
    locked?: boolean | undefined;
};

type PickerProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    options: readonly Option[];
    value?: string | undefined;
    onPick: ( key: string ) => void;
    onLocked?: (( key: string ) => void) | undefined;
    groups?: Record<string, string> | undefined;
    hint?: string | undefined;
    empty?: string | undefined;
    searchable?: boolean | undefined;
};

const matches = ( option: Option, needle: string ): boolean =>
    str.matches(option.label, needle)
    || str.matches(option.note ?? "", needle)
    || str.matches(option.key, needle)
    || ( option.terms ?? [] ).some(( term ) => str.matches(term, needle) );

export function Picker ({ open, onClose, title, options, value, onPick, onLocked, groups, hint, empty, searchable = true }: PickerProps) {

    const theme = useTheme();
    const [ query, setQuery ] = useState("");
    const long = options.length > 8;

    const shown = useMemo(() => {

        const needle = query.trim();

        if ( needle ) return options.filter(( option ) => matches(option, needle) );

        const chosen = long ? options.find(( option ) => option.key === value ) : undefined;

        return chosen ? [ chosen, ...options.filter(( option ) => option !== chosen ) ] : options;

    }, [ long, options, query, value ]);

    const decks = useMemo(() => {

        if ( !groups ) return [ { key: "all", label: null, rows: shown } ];

        return Object.entries(groups)
            .map(([ key, label ]) => ({ key, label, rows: shown.filter(( option ) => option.group === key ) }) )
            .filter(( deck ) => deck.rows.length > 0 );

    }, [ groups, shown ]);

    const take = ( option: Option ) => option.locked ? onLocked?.(option.key) : onPick(option.key);

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={title}
            scroll
            tall={long}
            fill={long}
            head={searchable ? (
                <View style={{ paddingBottom: theme.space["1"] }}>
                    <Search value={query} onChangeText={setQuery} placeholder={hint} on="base" />
                </View>
            ) : undefined}
        >
            {shown.length === 0 ? <Empty emblem="search" title={empty ?? title} compact /> : null}

            {decks.map(( deck ) => (
                <Fragment key={deck.key}>
                    {deck.label ? <Text rank="label" ink="soft">{deck.label}</Text> : null}

                    <View style={{ gap: theme.space["1"] }}>
                        {deck.rows.map(( option ) => (
                            <Press
                                key={option.key}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: option.key === value }}
                                onPress={() => take(option)}
                                muted={option.locked ? theme.fade.mute : 1}
                                sink="tile"
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: theme.space["3"],
                                    padding: theme.space["3"],
                                    borderRadius: theme.radius.tile,
                                    backgroundColor: option.key === value ? theme.state.selected : "transparent",
                                }}
                            >
                                {option.flag ? <Flag iso={option.flag} width={theme.composition.picker.flagWidth} shape="circle" raised /> : null}
                                {option.figure ? <Text rank="title" ltr>{option.figure}</Text> : null}
                                {option.icon ? <Icon name={option.icon} size={theme.icon.md} tint="soft" /> : null}

                                <View style={{ flex: 1, gap: theme.space["1"] }}>
                                    <Text rank="body">{option.label}</Text>
                                    {option.note ? <Text rank="note" ink="faint">{option.note}</Text> : null}
                                </View>

                                {option.locked
                                    ? <Icon name="lock" size={theme.icon.sm} tint="faint" />
                                    : <Check on={option.key === value} round />}
                            </Press>
                        ))}
                    </View>
                </Fragment>
            ))}
        </Sheet>
    );

}
