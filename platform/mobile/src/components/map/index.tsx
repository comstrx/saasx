import { useEffect, useRef, useState } from "react";
import { type GestureResponderEvent, type LayoutChangeEvent, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { StyleSheet } from "react-native-unistyles";
import { engine, mapCredit, project, Still, tileSide } from "@/components/still";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

export type MapBounds = {
    north: number;
    south: number;
    east: number;
    west: number;
};

export type MapPricePoint = {
    id: number;
    latitude: number;
    longitude: number;
    label: string;
};

type MapInset = {
    top: number;
    bottom: number;
};

type MapPlotProps = {
    bounds: MapBounds;
    points: readonly MapPricePoint[];
    activeId: number | null;
    onPress: ( id: number ) => void;
    onBoundsChange?: (( bounds: MapBounds ) => void) | undefined;
    native?: boolean | undefined;
    located?: boolean | undefined;
    inset?: MapInset | undefined;
};

type PinProps = {
    point: MapPricePoint;
    active: boolean;
    onPress: ( id: number ) => void;
};

const tight = 0.004;

const snapshot = 700;

export const boundsAround = ( latitude: number, longitude: number, reach = 0.03 ): MapBounds => ({
    north: latitude + reach,
    south: latitude - reach,
    east: longitude + reach,
    west: longitude - reach,
});

const regionOf = ( bounds: MapBounds ): Region => ({
    latitude: ( bounds.north + bounds.south ) / 2,
    longitude: ( bounds.east + bounds.west ) / 2,
    latitudeDelta: Math.max(tight, bounds.north - bounds.south),
    longitudeDelta: Math.max(tight, bounds.east - bounds.west),
});

const boundsOf = ( region: Region ): MapBounds => ({
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2,
});

const zoomOf = ( bounds: MapBounds, width: number, height: number ) => {

    const across = Math.max(0.0001, bounds.east - bounds.west) / 360;
    const down = Math.max(0.0001, project(bounds.south, 0, 0).y - project(bounds.north, 0, 0).y);

    const byWidth = Math.log2(Math.max(width, 1) / ( tileSide * across ));
    const byHeight = Math.log2(Math.max(height, 1) / ( tileSide * down ));

    return Math.min(16, Math.max(2, Math.floor(Math.min(byWidth, byHeight))));

};

function PricePin ({ point, active, onPress }: PinProps) {

    const theme = useTheme();
    const [ tracking, setTracking ] = useState(true);

    useEffect(() => {

        const timer = setTimeout(() => setTracking(false), snapshot);

        return () => clearTimeout(timer);

    }, []);

    return (
        <Marker
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            tracksViewChanges={tracking}
            zIndex={active ? theme.layer.sticky : theme.layer.raised}
            onPress={() => onPress(point.id) }
        >
            <View style={styles.berth}>
                <View style={[ styles.tag, active ? styles.tagActive : null ]}>
                    <Text rank="label" ink="strong" tint={active ? "on" : undefined} numberOfLines={1}>{point.label}</Text>
                </View>
            </View>
        </Marker>
    );

}

function NativePlot ({ bounds, points, activeId, onPress, onBoundsChange, located = false, inset }: MapPlotProps) {

    const theme = useTheme();
    const view = useRef<MapView>(null);
    const reported = useRef<MapBounds | null>(null);
    const [ initial ] = useState(() => regionOf(bounds));

    useEffect(() => {

        if ( bounds === reported.current ) return;

        view.current?.animateToRegion(regionOf(bounds), theme.beat.slow);

    }, [ bounds, theme.beat.slow ]);

    const report = ( region: Region ) => {

        const seen = boundsOf(region);

        reported.current = seen;
        onBoundsChange?.(seen);

    };

    return (
        <MapView
            ref={view}
            style={styles.fill}
            provider={engine}
            initialRegion={initial}
            customMapStyle={theme.map}
            userInterfaceStyle={theme.name}
            showsUserLocation={located}
            showsMyLocationButton={false}
            showsCompass={false}
            showsIndoors={false}
            toolbarEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            moveOnMarkerPress={false}
            mapPadding={{ top: inset?.top ?? 0, right: 0, bottom: inset?.bottom ?? 0, left: 0 }}
            loadingEnabled
            loadingBackgroundColor={theme.plane.well}
            onRegionChangeComplete={report}
        >
            {points.map(( point ) => {

                const active = point.id === activeId;

                return <PricePin key={`${ point.id }:${ active ? "on" : "off" }:${ point.label }`} point={point} active={active} onPress={onPress} />;

            })}
        </MapView>
    );

}

function TilePlot ({ bounds, points, activeId, onPress, onBoundsChange }: MapPlotProps) {

    const [ size, setSize ] = useState({ width: 0, height: 0 });
    const drag = useRef({ x: 0, y: 0, bounds });

    const measure = ( event: LayoutChangeEvent ) => setSize(event.nativeEvent.layout);

    const scale = zoomOf(bounds, size.width, size.height);
    const centre = project(( bounds.north + bounds.south ) / 2, ( bounds.east + bounds.west ) / 2, scale);
    const origin = {
        x: size.width / 2 - centre.x * tileSide,
        y: size.height / 2 - centre.y * tileSide,
    };

    const locate = ( latitude: number, longitude: number ) => {

        const point = project(latitude, longitude, scale);

        return { x: origin.x + point.x * tileSide, y: origin.y + point.y * tileSide };

    };

    const begin = ( event: GestureResponderEvent ) => {

        drag.current = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
            bounds,
        };

    };

    const move = ( event: GestureResponderEvent ) => {

        if ( !onBoundsChange || size.width <= 0 || size.height <= 0 ) return;

        const source = drag.current.bounds;
        const world = tileSide * 2 ** zoomOf(source, size.width, size.height);
        const dx = ( event.nativeEvent.locationX - drag.current.x ) / world * 360;
        const dy = ( event.nativeEvent.locationY - drag.current.y ) / world * 360;

        onBoundsChange({
            north: source.north + dy,
            south: source.south + dy,
            east: source.east - dx,
            west: source.west - dx,
        });

    };

    return (
        <View
            style={styles.map}
            onLayout={measure}
            onTouchStart={begin}
            onMoveShouldSetResponder={() => Boolean(onBoundsChange)}
            onResponderMove={move}
        >
            <Still
                latitude={( bounds.north + bounds.south ) / 2}
                longitude={( bounds.east + bounds.west ) / 2}
                zoom={scale}
            />

            {size.width > 0 ? points.map(( point ) => {

                const location = locate(point.latitude, point.longitude);
                const active = point.id === activeId;

                return (
                    <Press
                        key={point.id}
                        style={[ styles.pin, styles.pinAt(location.x, location.y), active ? styles.pinActive : null ]}
                        onPress={() => onPress(point.id) }
                        sink="disc"
                        accessibilityRole="button"
                        accessibilityLabel={point.label}
                    >
                        <Text rank="micro" tint="on" numberOfLines={1}>{point.label}</Text>
                    </Press>
                );

            }) : null}

            <View style={styles.credit} pointerEvents="none">
                <Text rank="micro" ink="soft" numberOfLines={1}>{mapCredit}</Text>
            </View>
        </View>
    );

}

export function MapPlot ({ native = false, ...plot }: MapPlotProps) {

    return native ? <NativePlot {...plot} /> : <TilePlot {...plot} />;

}

const styles = StyleSheet.create(( theme ) => ({

    fill: {
        ...StyleSheet.absoluteFillObject,
    },
    berth: {
        padding: theme.space["2"],
    },
    tag: {
        minHeight: theme.mark.sm,
        minWidth: theme.mark.md,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.space["3"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.plane.base,
        boxShadow: theme.depth.float.boxShadow,
    },
    tagActive: {
        backgroundColor: theme.tone.brand.base,
    },
    map: {
        flex: 1,
        overflow: "hidden",
        direction: "ltr",
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    pin: {
        position: "absolute",
        minWidth: theme.art.sm,
        height: theme.mark.sm,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.space["2"],
        borderRadius: theme.radius.tag,
        borderWidth: theme.stroke.base,
        borderColor: theme.material.lit,
        backgroundColor: theme.tone.brand.deep,
        boxShadow: theme.depth.float.boxShadow,
    },
    pinActive: {
        height: theme.mark.base,
        borderRadius: theme.radius.tag,
        backgroundColor: theme.tone.accent.deep,
        transform: [ { scale: 1.08 } ],
    },
    pinAt: ( x: number, y: number ) => ({
        left: x - 33,
        top: y - 16,
    }),
    credit: {
        position: "absolute",
        left: theme.space["2"],
        bottom: theme.space["2"],
        paddingHorizontal: theme.space["2"],
        paddingVertical: 2,
        borderRadius: theme.radius.tag,
        backgroundColor: theme.plane.raised,
    },

}));
