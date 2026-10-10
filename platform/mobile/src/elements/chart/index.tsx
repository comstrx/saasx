import { Fragment, useState } from "react";
import { I18nManager, type LayoutChangeEvent, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type Point = { x: number; y: number };

const monotone = ( points: readonly Point[] ): string => {

    const first = points[0];

    if ( !first ) return "";
    if ( points.length < 2 ) return `M ${ first.x } ${ first.y }`;

    const step = ( points[1]?.x ?? 0 ) - first.x;
    const slopes = points.slice(0, -1).map(( point, index ) => ( ( points[index + 1]?.y ?? point.y ) - point.y ) / ( step || 1 ) );
    const tangents = points.map(( _, index ) => {

        const before = slopes[index - 1];
        const after = slopes[index];

        if ( before === undefined ) return after ?? 0;
        if ( after === undefined ) return before;

        return before * after <= 0 ? 0 : ( before + after ) / 2;

    });

    slopes.forEach(( slope, index ) => {

        if ( slope === 0 ) { tangents[index] = 0; tangents[index + 1] = 0; return; }

        const lead = ( tangents[index] ?? 0 ) / slope;
        const trail = ( tangents[index + 1] ?? 0 ) / slope;
        const reach = lead * lead + trail * trail;

        if ( reach <= 9 ) return;

        const pull = 3 / Math.sqrt(reach);

        tangents[index] = pull * lead * slope;
        tangents[index + 1] = pull * trail * slope;

    });

    return points.slice(1).reduce(( path, point, index ) => {

        const from = points[index] ?? point;
        const lead = tangents[index] ?? 0;
        const trail = tangents[index + 1] ?? 0;
        const reach = step / 3;

        return `${ path } C ${ from.x + reach } ${ from.y + lead * reach } ${ point.x - reach } ${ point.y - trail * reach } ${ point.x } ${ point.y }`;

    }, `M ${ first.x } ${ first.y }`);

};

export type Trace = {
    key: string;
    tone: ToneName;
    values: readonly number[];
};

export type Mark = {
    key: string;
    label: string;
};

type FlowProps = {
    marks: readonly Mark[];
    traces: readonly Trace[];
    height?: number | undefined;
};

export function Flow ({ marks, traces, height = 112 }: FlowProps) {

    const theme = useTheme();
    const [ width, setWidth ] = useState(0);

    const turned = ( values: readonly number[] ): readonly number[] => I18nManager.isRTL ? [ ...values ].reverse() : values;
    const peak = Math.max(1, ...traces.flatMap(( trace ) => trace.values )) * 1.2;
    const edge = theme.stroke.rail;
    const floor = height - edge;
    const span = Math.max(1, ( traces[0]?.values.length ?? 1 ) - 1);

    const plot = ( values: readonly number[] ): readonly Point[] => turned(values).map(( value, index ) => ({
        x: edge + ( index * ( width - edge * 2 ) ) / span,
        y: floor - ( value / peak ) * ( floor - edge ),
    }));

    const measure = ( event: LayoutChangeEvent ) => setWidth(Math.round(event.nativeEvent.layout.width));

    return (
        <View style={{ gap: theme.space["2"] }}>
            <View onLayout={measure} style={{ height }}>
                {width > 0 ? (
                    <Svg width={width} height={height}>
                        <Rect x={0} y={floor} width={width} height={theme.stroke.thin} fill={theme.line.hair} />

                        {traces.map(( trace ) => {

                            const points = plot(trace.values);
                            const paint = theme.tone[trace.tone].base;
                            const lead = points[0];
                            const last = points[points.length - 1];

                            if ( !lead || !last ) return null;

                            return (
                                <Fragment key={trace.key}>
                                    <Path
                                        d={`${ monotone(points) } L ${ last.x } ${ floor } L ${ lead.x } ${ floor } Z`}
                                        fill={theme.tone[trace.tone].soft}
                                    />

                                    <Path
                                        d={monotone(points)}
                                        stroke={paint}
                                        strokeWidth={theme.stroke.base}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />

                                    <Circle cx={last.x} cy={last.y} r={theme.stroke.rail} fill={paint} />
                                </Fragment>
                            );

                        })}
                    </Svg>
                ) : null}
            </View>

            <View style={{ flexDirection: "row" }}>
                {marks.map(( mark ) => (
                    <View key={mark.key} style={{ flex: 1, alignItems: "center" }}>
                        <Text rank="micro" ink="faint">{mark.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

}

type LegendProps = {
    tone: ToneName;
    label: string;
    value: string;
};

export function Legend ({ tone, label, value }: LegendProps) {

    const theme = useTheme();
    const dot = theme.stroke.rail;

    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space["3"] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["2"] }}>
                <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: theme.tone[tone].base }} />
                <Text rank="caption" ink="soft">{label}</Text>
            </View>

            <Text rank="label" numberOfLines={1} figures>{value}</Text>
        </View>
    );

}
