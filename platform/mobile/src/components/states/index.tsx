import type { ReactNode } from "react";
import { useWindowDimensions, View } from "react-native";
import { Box, type Step } from "@/elements/box";
import { Divider } from "@/elements/divider";
import type { EmblemName } from "@/elements/emblem";
import { Empty } from "@/elements/empty";
import type { IconName } from "@/elements/icon";
import { Swap } from "@/elements/motion";
import { Skeleton } from "@/elements/skeleton";
import { useTheme } from "@/theme/use-theme";

type FailureProps = {
    title: string;
    note?: string | undefined;
    action?: string | undefined;
    onAction?: (() => void) | undefined;
    emblem?: EmblemName | undefined;
    deed?: IconName | undefined;
    aside?: string | undefined;
    compact?: boolean | undefined;
};

export function Failure ({ title, note, action, onAction, emblem = "tool", deed, aside, compact = false }: FailureProps) {

    return <Empty title={title} note={note} emblem={emblem} action={action} deed={deed} onAction={onAction} aside={aside} compact={compact} />;

}

type LoadingShape = "list" | "grid" | "detail" | "card" | "rows" | "rail" | "types";

type LoadingProps = {
    shape?: LoadingShape | undefined;
    rows?: number | undefined;
    span?: number | undefined;
};

export function Loading ({ shape = "list", rows = 4, span }: LoadingProps) {

    const theme = useTheme();
    const { width } = useWindowDimensions();

    const seats = ( count: number ) => Array.from({ length: count }, ( _, seat ) => `seat-${ seat }` );

    const shell = theme.card;

    if ( shape === "types" ) return (
        <View style={{ flexDirection: "row", gap: theme.space["1"] }}>
            {seats(rows).map(( key ) => (
                <View key={key} style={{ alignItems: "center", gap: theme.space["2"], width: theme.composition.domains.width }}>
                    <Skeleton width={theme.composition.domains.tile} height={theme.composition.domains.tile} curve="tile" />
                    <Skeleton width="70%" height={theme.text.note.latin.height} />
                </View>
            ))}
        </View>
    );

    if ( shape === "rail" ) return (
        <View style={{ flexDirection: "row", gap: theme.space["3"] }}>
            {seats(rows).map(( key ) => (
                <View key={key} style={{ gap: theme.space["3"], width: span ?? Math.round(( width - theme.layout.gutter * 2 ) * 0.6) }}>
                    <Skeleton height={Math.round(( span ?? Math.round(( width - theme.layout.gutter * 2 ) * 0.6) ) / theme.ratio.photo)} curve="tile" />

                    <View style={{ gap: theme.space["2"] }}>
                        <Skeleton width="76%" height={theme.text.title.latin.height} />
                        <Skeleton width="48%" height={theme.text.caption.latin.height} />
                        <Skeleton width="34%" height={theme.text.title.latin.height} />
                    </View>
                </View>
            ))}
        </View>
    );

    if ( shape === "card" ) return (
        <View style={{ gap: theme.space["3"] }}>
            {seats(rows).map(( key ) => (
                <Box plane="base" key={key} style={{ ...shell, padding: theme.space["4"], gap: theme.space["3"] }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Skeleton width="22%" height={theme.text.note.latin.height} />
                        <Skeleton width="26%" height={theme.tag.md} curve="tag" />
                    </View>

                    <View style={{ flexDirection: "row", gap: theme.space["3"] }}>
                        <Skeleton width={theme.layout.thumb} height={theme.layout.thumb} curve="tile" />

                        <View style={{ flex: 1, gap: theme.space["2"], justifyContent: "center" }}>
                            <Skeleton width="80%" height={theme.text.label.latin.height} />
                            <Skeleton width="50%" height={theme.text.caption.latin.height} />
                            <Skeleton width="34%" height={theme.text.title.latin.height} />
                        </View>
                    </View>
                </Box>
            ))}
        </View>
    );

    if ( shape === "rows" ) return (
        <Box plane="base" style={{ ...shell, paddingHorizontal: theme.space["4"] }}>
            {seats(rows).map(( key, index ) => (
                <View key={key}>
                    {index > 0 ? <Divider /> : null}

                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["4"], paddingVertical: theme.space["4"] }}>
                        <Skeleton width={theme.control.sm.height} height={theme.control.sm.height} curve="control" />

                        <View style={{ flex: 1, gap: theme.space["2"] }}>
                            <Skeleton width="46%" height={theme.text.label.latin.height} />
                            <Skeleton width="70%" height={theme.text.note.latin.height} />
                        </View>
                    </View>
                </View>
            ))}
        </Box>
    );

    if ( shape === "detail" ) return (
        <View style={{ gap: theme.space["5"] }}>
            <Skeleton height={Math.round(theme.art.xl * 1.7)} curve="tile" />
            <Skeleton width="70%" height={theme.text.heading.latin.height} />
            <Skeleton width="45%" height={theme.text.label.latin.height} />
            <Skeleton height={theme.text.body.latin.height} />
            <Skeleton height={theme.text.body.latin.height} />
            <Skeleton width="60%" height={theme.text.body.latin.height} />
        </View>
    );

    if ( shape === "grid" ) {

        const cell = Math.floor(( width - theme.layout.gutter * 2 - theme.space["3"] ) / 2);

        return (
            <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: theme.space["3"], rowGap: theme.space["5"] }}>
                {seats(rows * 2).map(( key ) => (
                    <View key={key} style={{ width: cell, gap: theme.space["3"] }}>
                        <Skeleton height={Math.round(cell / theme.ratio.photo)} curve="tile" />

                        <View style={{ gap: theme.space["2"] }}>
                            <Skeleton width="80%" height={theme.text.title.latin.height} />
                            <Skeleton width="56%" height={theme.text.caption.latin.height} />
                            <Skeleton width="40%" height={theme.text.title.latin.height} />
                        </View>
                    </View>
                ))}
            </View>
        );

    }

    return (
        <View style={{ gap: theme.space["5"] }}>
            {seats(rows).map(( key ) => (
                <Box plane="base" key={key} style={{ ...shell, flexDirection: "row", gap: theme.space["3"], padding: theme.space["3"] }}>
                    <Skeleton width={theme.layout.thumb} height={theme.layout.thumb} curve="tile" />

                    <View style={{ flex: 1, gap: theme.space["2"], justifyContent: "center" }}>
                        <Skeleton width="70%" height={theme.text.label.latin.height} />
                        <Skeleton width="45%" height={theme.text.caption.latin.height} />
                        <Skeleton width="30%" height={theme.text.title.latin.height} />
                    </View>
                </Box>
            ))}
        </View>
    );

}

type Phase = "loading" | "failed" | "empty" | "ready";

type PhaseProps = {
    phase: Phase;
    children: ReactNode;
    loading: ReactNode;
    failed?: ReactNode | undefined;
    empty?: ReactNode | undefined;
    gap?: Step | undefined;
};

export const phaseOf = ( pending: boolean, broken: boolean, bare: boolean ): Phase =>
    broken ? "failed" : pending ? "loading" : bare ? "empty" : "ready";

export function Phased ({ phase, children, loading, failed, empty, gap = "6" }: PhaseProps) {

    const theme = useTheme();

    const shown = phase === "loading" ? loading
        : phase === "failed" ? failed ?? loading
            : phase === "empty" ? empty ?? null
                : children;

    return <Swap watch={phase} style={{ flexGrow: 1, gap: theme.space[gap] }}>{shown}</Swap>;

}
