import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { Art, type Artwork } from "@/elements/art";
import { Button } from "@/elements/button";
import { useFloor, useLaneFloor } from "@/elements/dock/floor";
import { Emblem, type EmblemName } from "@/elements/emblem";
import { type Shift, settledShift, shiftOf } from "@/elements/empty/centre";
import type { IconName } from "@/elements/icon";
import { Appear } from "@/elements/motion";
import { Text } from "@/elements/text";
import { useLane } from "@/store/lane";
import { useTheme } from "@/theme/use-theme";

type EmptyProps = {
    title: string;
    note?: string | undefined;
    emblem?: EmblemName | undefined;
    art?: Artwork | undefined;
    action?: string | undefined;
    deed?: IconName | undefined;
    onAction?: (() => void) | undefined;
    aside?: string | undefined;
    fill?: boolean | undefined;
    compact?: boolean | undefined;
};

export function Empty ({ title, note, emblem = "search", art, action, deed, onAction, aside, fill = true, compact = false }: EmptyProps) {

    const theme = useTheme();
    const { height } = useWindowDimensions();
    const { rt: { insets } } = useUnistyles();
    const reserve = useFloor();
    const held = useLane(( state ) => state.held );
    const seat = useRef<View>(null);
    const block = useRef(0);
    const [ shift, setShift ] = useState<Shift>(settledShift);
    const figure = compact ? theme.composition.empty.compactFigure : theme.composition.empty.figure;
    const lane = useLaneFloor();
    const chrome = Math.max(reserve, insets.bottom, held ? lane + theme.layout.lane + theme.space["3"] : 0);

    const measure = useCallback(() => {

        if ( !fill ) return;

        seat.current?.measureInWindow(( _x, top, _width, tall ) => {

            if ( top >= height ) return;

            setShift(( last ) => {

                const next = shiftOf({ top, tall }, block.current, height - chrome, last);

                return next.top === last.top && next.bottom === last.bottom ? last : next;

            });

        });

    }, [ fill, height, chrome ]);

    useEffect(measure, [ measure ]);

    return (
        <View ref={seat} onLayout={measure} style={fill ? { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingTop: shift.top, paddingBottom: shift.bottom } : { alignItems: "center" }}>
            <Appear from="below" style={{ alignSelf: "stretch", alignItems: "center" }}>
                <View
                    accessibilityRole="summary"
                    onLayout={( event ) => { block.current = event.nativeEvent.layout.height; measure(); }}
                    style={{
                        alignItems: "center",
                        width: "100%",
                        maxWidth: theme.composition.empty.maxWidth,
                        gap: theme.space[compact ? "3" : "4"],
                        paddingHorizontal: theme.space["6"],
                        paddingVertical: theme.space[compact ? "5" : "6"],
                    }}
                >
                    <Appear from="still" delay={theme.beat.stagger} style={{ alignItems: "center" }}>
                        {art ? <Art name={art} size={figure} /> : <Emblem name={emblem} size={figure} />}

                        <View pointerEvents="none" style={{ width: figure * 0.62, height: theme.space["2"], marginTop: -theme.space["1"], borderRadius: theme.radius.pill, backgroundColor: theme.contact, filter: [ { blur: theme.space["1.5"] } ] }} />
                    </Appear>

                    <View style={{ alignSelf: "stretch", gap: theme.space["2"], alignItems: "center" }}>
                        <Text rank={compact ? "title" : "heading"} align="center" numberOfLines={2} style={{ alignSelf: "stretch" }}>{title}</Text>
                        {note ? <Text rank="description" ink="soft" align="center" style={{ maxWidth: theme.composition.empty.copyWidth }}>{note}</Text> : null}
                    </View>

                    {action ? (
                        <View style={{ flexDirection: "row", justifyContent: "center" }}>
                            <Button label={action} icon={deed} block={false} onPress={onAction} />
                        </View>
                    ) : null}

                    {aside ? <Text rank="note" ink="faint" align="center">{aside}</Text> : null}
                </View>
            </Appear>
        </View>
    );

}
