import { Image } from "expo-image";
import { useState } from "react";
import { type LayoutChangeEvent, Platform, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet } from "react-native-unistyles";
import { useTheme } from "@/theme/use-theme";

type StillProps = {
    latitude: number;
    longitude: number;
    zoom?: number;
    native?: boolean | undefined;
};

const side = 256;

const mapKey = process.env.EXPO_PUBLIC_MAP_KEY ?? "";

export const engine = Platform.OS === "android" ? PROVIDER_GOOGLE : undefined;

export const mapCredit = mapKey ? "© MapTiler · OpenStreetMap" : "© Esri";

const source = ( dark: boolean, zoom: number, x: number, y: number ) =>
    mapKey
        ? `https://api.maptiler.com/maps/${ dark ? "streets-v2-dark" : "streets-v2" }/${ zoom }/${ x }/${ y }.png?key=${ mapKey }`
        : `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${ zoom }/${ y }/${ x }`;

export const tileSide = side;

export const project = ( latitude: number, longitude: number, zoom: number ) => {

    const span = 2 ** zoom;
    const shaped = Math.min(85.05112878, Math.max(-85.05112878, latitude)) * Math.PI / 180;

    return {
        x: ( longitude + 180 ) / 360 * span,
        y: ( 1 - Math.log(Math.tan(shaped) + 1 / Math.cos(shaped)) / Math.PI ) / 2 * span,
    };

};

export function Still ({ latitude, longitude, zoom = 14, native = false }: StillProps) {

    const theme = useTheme();
    const [ size, setSize ] = useState({ width: 0, height: 0 });
    const dark = theme.name === "dark";

    if ( native ) {

        const span = 360 / 2 ** zoom;

        return (
            <View style={styles.plane} pointerEvents="none">
                <MapView
                    style={styles.fill}
                    provider={engine}
                    liteMode
                    initialRegion={{ latitude, longitude, latitudeDelta: span, longitudeDelta: span }}
                    customMapStyle={theme.map}
                    userInterfaceStyle={theme.name}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    toolbarEnabled={false}
                    loadingEnabled
                    loadingBackgroundColor={theme.plane.well}
                />
            </View>
        );

    }

    const measure = ( event: LayoutChangeEvent ) => setSize(event.nativeEvent.layout);

    const centre = project(latitude, longitude, zoom);
    const span = 2 ** zoom;

    const columns = size.width > 0 ? Math.ceil(size.width / side) + 2 : 0;
    const rows = size.height > 0 ? Math.ceil(size.height / side) + 2 : 0;

    const originX = size.width / 2 - centre.x * side;
    const originY = size.height / 2 - centre.y * side;

    const firstX = Math.floor(-originX / side);
    const firstY = Math.floor(-originY / side);

    const tiles = [];

    for ( let column = 0; column < columns; column += 1 ) {

        for ( let row = 0; row < rows; row += 1 ) {

            const x = firstX + column;
            const y = firstY + row;

            if ( y < 0 || y >= span ) continue;

            tiles.push({
                key: `${ x }-${ y }`,
                url: source(dark, zoom, ( ( x % span ) + span ) % span, y),
                left: originX + x * side,
                top: originY + y * side,
            });

        }

    }

    return (
        <View style={styles.plane} onLayout={measure}>
            {tiles.map(( tile ) => (
                <Image
                    key={tile.key}
                    source={tile.url}
                    style={styles.tile(tile.left, tile.top)}
                    contentFit="cover"
                    transition={140}
                    cachePolicy="disk"
                />
            ))}

            {dark && !mapKey ? <View style={styles.dusk} pointerEvents="none" /> : null}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    plane: {
        flex: 1,
        alignSelf: "stretch",
        overflow: "hidden",
        direction: "ltr",
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    fill: {
        ...StyleSheet.absoluteFillObject,
    },
    dusk: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.photo.dusk,
    },
    tile: ( left: number, top: number ) => ({
        position: "absolute",
        left,
        top,
        width: side,
        height: side,
    }),

}));
